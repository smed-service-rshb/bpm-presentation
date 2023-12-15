import processDefinitionService from './ProcessDefinitionService'

let counter = 0;
const nextCounter = () => (++counter).toString();

const USER_TASK_EXECUTION_STATE = "USER_TASK";
const WAITING_ASYNC_EXECUTION_STATE = "WAITING_ASYNC";
//TODO имитация const FAILED_JOB_EXECUTION_STATE = "FAILED_JOB";

const defaultVariablesMapping = (...args) => context => {
    const result = {};
    args.forEach(variableName => {
        result[variableName] = context[variableName];
    });
    return result;
};

class StartSubprocessActivity {
    constructor(subprocessKey, serviceName, parent) {
        this.subprocessKey = subprocessKey;
        this.serviceName = serviceName;
        this.parentProcess = parent;
        this.outputVariablesMapping = defaultVariablesMapping();
        this.inputVariablesMapping = defaultVariablesMapping();
    }

    inputVariables(...args) {
        return this.mapInputVariables(defaultVariablesMapping(...args))
    }

    mapInputVariables(mapping) {
        this.inputVariablesMapping = mapping;
        return this;
    }

    outputVariables(...args) {
        return this.mapOutputVariables(defaultVariablesMapping(...args))
    }

    mapOutputVariables(mapping) {
        this.outputVariablesMapping = mapping;
        return this;
    }

    onFinish(onFinishTask) {
        this.process = this.parentProcess.startSubprocess(this.subprocessKey, this.serviceName, this.inputVariablesMapping(this.parentProcess.getVariables()));
        if (typeof onFinishTask === "function") {
            this.onFinishTask = onFinishTask;
        }
        else {
            this.onFinishTask = ({success}) => success(onFinishTask);
        }
        return this
    }

    getProcessInfo() {
        return this.process.buildInfo();
    }

    leave({context, ...args}) {
        setImmediate(() => {
            let subprocessContext = this.process.getVariables();
            const variables = this.outputVariablesMapping(subprocessContext);
            this.onFinishTask({...args, context: this.parentProcess.addVariables(variables), subprocessContext})
        })
    }
}

class StartEventActivity {
    constructor(startEvent) {
        this.handler = startEvent;
    }

    leave(...args) {
        this.handler(...args)
    }
}

class TaskOwner {
    constructor(personnelNumber, surName, firstName, middleName) {
        this.personnelNumber = personnelNumber;
        this.surName = surName;
        this.firstName = firstName;
        this.middleName = middleName;
    }

    buildInfo() {
        return {
            personnelNumber: this.personnelNumber,
            surName: this.surName,
            firstName: this.firstName,
            middleName: this.middleName
        }
    }
}

function createOwner(personnelNumber) {
    return new TaskOwner(personnelNumber, 'Иванов', 'Виктор', 'Александрович');
}

class UserTaskActivity {
    constructor(userTaskDefinition, processInstance) {
        this.id = nextCounter();
        this.processInstance = processInstance;
        this.userTaskDefinition = userTaskDefinition;
        this.createDate = new Date();
        this.dueDate = new Date();
        this.office = "5423";
        this.owner = createOwner('N79000000000');
    }

    getId() {
        return this.id;
    }

    getProcessInstance() {
        return this.processInstance
    }

    buildShortInfo() {
        return {
            id: this.id,
            serviceName: this.processInstance.getServiceName(),
            definitionKey: this.userTaskDefinition.getKey(),
        }
    }

    buildInfo() {
        return {
            ...this.buildShortInfo(),
            subject: this.processInstance.subject,
            variables: this.processInstance.getVariables(),
            processInfo: this.getProcessInstance().buildShortInfo(),
            superProcess: this.getProcessInstance().buildSuperProcessInfo()
        }
    }

    buildAggregationInfo() {
        const superProcessInfo = this.getProcessInstance().buildSuperProcessInfo();

        return {
            id: this.id,
            key: this.userTaskDefinition.getKey(),
            name: this.userTaskDefinition.getName(),
            createDate: this.createDate,
            dueDate: this.dueDate,
            currentProcess: {
                id: this.processInstance.getId(),
                key: this.processInstance.definition.getKey(),
                name: this.processInstance.definition.getName(),
                moduleName: this.processInstance.getServiceName()
            },
            superProcess: superProcessInfo && {
                id: superProcessInfo.id,
                key: superProcessInfo.definitionKey,
                name: "Что-то там",
                moduleName: superProcessInfo.serviceName,
            },
            office: this.office,
            client: this.processInstance.subject,
            owner:  !!this.owner ? this.owner.buildInfo(): null
        }
    }

    isCompleted() {
        return this.processInstance.getCurrentActivity() !== this;
    }

    leave(...args) {
        this.userTaskDefinition.getHandler()(...args)
    }
}


class ProcessInstance {
    constructor(definition, runtimeService, parent) {
        this.runtimeService = runtimeService;
        this.parent = parent;
        this.definition = definition;
        this.context = {
            setSubject: subject => this.subject = subject,
        };
        this.finished = false;
        this.subject = parent && parent.subject;
    }

    getId() {
        return this.id;
    }

    getServiceName() {
        return this.definition.getServiceName();
    }

    getVariables() {
        return this.context;
    }

    addVariables(variables) {
        this.context = {
            ...this.context,
            ...variables
        };
        return this.context;
    }

    isFinished() {
        return this.finished;
    }

    getCurrentActivity() {
        return this.currentActivity;
    }

    finish() {
        this.finished = true;
        this.currentActivity = null;
        if (this.parent) {
            this.parent.subprocessFinished(this);
        }
    }

    leaveCurrentActivity({error, request} = {}) {
        let isSuccess = false;
        const success = nextTask => {
            const userTaskDefinition = this.definition.getUserTask(nextTask);
            if (!userTaskDefinition) {
                throw new Error(`Активити ${nextTask} не найдена`)
            }
            this.currentActivity = new UserTaskActivity(userTaskDefinition, this);
            this.runtimeService.registerActivity(this.currentActivity);
            isSuccess = true;
        };
        const endProcess = () => {
            isSuccess = true;
            this.finish.bind(this)();
        };

        const startSubprocess = (subprocessKey, serviceName) => {
            isSuccess = true;
            if (serviceName == null) {
                serviceName = this.getServiceName();
            }
            this.currentActivity = new StartSubprocessActivity(subprocessKey, serviceName, this);
            return this.currentActivity;
        };

        this.currentActivity.leave({
            context: this.context,
            endProcess,
            startSubprocess,
            success,
            error,
            request,
        });
        return isSuccess;
    }

    start(variables = {}) {
        if (this.id) {
            throw new Error(`Процесс ${this.id} уже стартован`)
        }
        this.id = nextCounter();
        this.context = {
            ...variables,
            setSubject: subject => this.subject = subject,
        };
        this.currentActivity = new StartEventActivity(this.definition.getStartEvent());
    }

    startSubprocess(subprocessKey, serviceName, inputVariables) {
        return this.runtimeService.startSubprocess(subprocessKey, serviceName, this, inputVariables)
    }

    subprocessFinished(subprocess) {
        if (!(this.currentActivity instanceof StartSubprocessActivity)) {
            throw new Error(`Процесс ${this} не ожидает завершения подпроцесса ${subprocess}`);
        }
        this.leaveCurrentActivity()
    }

    buildInfo() {
        const result = {
            ...this.buildShortInfo(),
            subject: this.subject,
            variables: this.context,
            superProcess: this.buildSuperProcessInfo(),
            finished: this.finished
        };
        if (this.finished) {
            return result;
        }
        if (this.currentActivity instanceof UserTaskActivity) {
            return {
                ...result,
                activeUserTask: this.currentActivity.buildShortInfo(),
                executionState: [USER_TASK_EXECUTION_STATE]
            };
        }
        if (this.currentActivity instanceof StartSubprocessActivity) {
            const processInfo = this.currentActivity.getProcessInfo();
            if (processInfo.finished) {
                return {
                    ...result,
                    executionState: [WAITING_ASYNC_EXECUTION_STATE]
                }
            }
            return {
                ...result,
                activeUserTask: processInfo.activeUserTask,
                executionState: [USER_TASK_EXECUTION_STATE]
            };
        }
        return result;
    }

    buildShortInfo() {
        return {
            id: this.id,
            serviceName: this.getServiceName(),
            definitionKey: this.definition.getKey(),
        }
    }

    buildSuperProcessInfo() {
        if (!this.parent) {
            return null;
        }
        let parent = this.parent;
        while (true) {
            if (!parent.parent) {
                return parent.buildShortInfo()
            }
            parent = parent.parent
        }
    }
}

class RuntimeService {
    constructor() {
        this.processes = {};
        this.tasks = {};
    }

    getProcessInstance(id) {
        return this.processes[id]
    }

    getTasks() {
        return this.tasks;
    }

    getTask(id) {
        return this.tasks[id]
    }

    registerActivity(task) {
        this.tasks[task.getId()] = task;
    }

    startProcess(serviceName, key, {error, request}) {
        const processDefinition = processDefinitionService.getProcess(serviceName, key);
        if (!processDefinition) {
            error(404, `Процесс с ключом ${key} не найден в сервисе ${serviceName}`);
            return null;
        }
        const process = new ProcessInstance(processDefinition, this);
        let hasError = false;
        const customError = (...args) => {
            hasError = true;
            error(...args);
        };
        process.start();
        process.leaveCurrentActivity({error: customError, request})
        if (hasError) {
            return null
        }
        this.processes[process.getId()] = process;
        return process;
    }

    startSubprocess(key, serviceName, parent, variables) {
        const processDefinition = processDefinitionService.getSubrocess(serviceName, key);
        if (!processDefinition) {
            throw new Error(`Подпроцесс с ключом ${key} не найден в сервисе ${serviceName}`);
        }
        const process = new ProcessInstance(processDefinition, this, parent);
        process.start(variables);
        process.leaveCurrentActivity();
        this.processes[process.getId()] = process;
        return process;
    }

    complete(taskId, {error, request}) {
        const task = this.getTask(taskId);
        if (!task) {
            error(404, `Зачада с идентификатором  ${taskId} не найдена`);
            return null;
        }
        const processInstance = task.getProcessInstance();

        const activity = processInstance.getCurrentActivity();
        if (activity === task) {
            processInstance.leaveCurrentActivity({error, request});
            return processInstance;
        }
        error(410, processInstance.buildInfo());
        return null;
    }

    returnTasks(taskIds, {success, error}) {
        const tasks_ = [];
        taskIds.forEach(id => {
            const task_ = this.getTask(id);
            if(!task_ || !task_.owner) {
                error(400);
                return null;
            }
            tasks_.push(task_);
            return id;
        });
        tasks_.forEach(task => {
            task.owner = null;
        });
        success();
        return null;
    }

    takeTasks(personnelNumber, office, taskIds, {success, error}) {
        const tasks_ = [];
        taskIds.forEach(id => {
            const task_ = this.getTask(id);
            if(task_ === null) {
                error(400);
                return null;
            }
            tasks_.push(task_);
            return id;
        });
        tasks_.forEach(task => {
            task.owner = createOwner(personnelNumber);
        });
        success();
        return null;
    }
}

export default new RuntimeService()