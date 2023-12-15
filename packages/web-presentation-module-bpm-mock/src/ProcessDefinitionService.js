class UserTaskDefinition {
    constructor(key, handler) {
        this.key = key;
        this.name = `Условное обозначение задачи ${key}`;
        this.handler = handler;
    }

    getKey() {
        return this.key;
    }

    getName() {
        return this.name;
    }

    getHandler() {
        return this.handler;
    }
}

class ProcessDefinition {
    constructor(key, serviceName) {
        this.userTasks = {};
        this.key = key;
        this.name = `Условное обозначение процесса ${serviceName} ${key}`;
        this.serviceName = serviceName;
    }

    getKey() {
        return this.key;
    }

    getName() {
        return this.name;
    }

    getServiceName() {
        return this.serviceName;
    }

    setStartEvent(startEventHandler) {
        if (this.startEventHandler) {
            throw new Error(`У процесса ${this.key} не может  быть нескольких startEvent`);
        }
        this.startEventHandler = startEventHandler;
    }

    getStartEvent() {
        return this.startEventHandler;
    }

    addUserTask(key, handler) {
        if (this.userTasks[key]) {
            throw new Error(`У процесса ${this.key} не может быть нескольких активити с одинаковым идентификаторм ${key}`);
        }
        this.userTasks[key] = new UserTaskDefinition(key, handler)
    }

    getUserTask(key) {
        return this.userTasks[key];
    }
}

class ProcessDefinitionBuilder {
    constructor(definition) {
        this.currentProcess = definition
    }

    startEvent(handler) {
        this.currentProcess.setStartEvent(handler);
        return this;
    }

    userTask(key, handler) {
        this.currentProcess.addUserTask(key, handler);
        return this;
    }

    build() {
        return this.currentProcess
    }
}

class ProcessDefinitionService {
    constructor() {
        this.processDefinitions = {};
        this.subprocessDefinitions = {};
    }

    buildFor(serviceName) {
        return {
            createProcess: key => {
                const builder = new ProcessDefinitionBuilder(new ProcessDefinition(key, serviceName));
                this.processDefinitions[serviceName] = this.processDefinitions[serviceName] || {};
                this.processDefinitions[serviceName][key] = builder;
                return builder;
            },

            createSubprocess: key => {
                const builder = new ProcessDefinitionBuilder(new ProcessDefinition(key, serviceName));
                this.subprocessDefinitions[serviceName] = this.subprocessDefinitions[serviceName] || {};
                this.subprocessDefinitions[serviceName][key] = builder;
                return builder;
            }
        }
    }

    getProcess(serviceName, key) {
        return this.processDefinitions[serviceName] && this.processDefinitions[serviceName][key] && this.processDefinitions[serviceName][key].build();
    }

    getSubrocess(serviceName, key) {
        return this.subprocessDefinitions[serviceName] && this.subprocessDefinitions[serviceName][key] && this.subprocessDefinitions[serviceName][key].build();
    }
}

const processDefinitionService = new ProcessDefinitionService();

export default processDefinitionService