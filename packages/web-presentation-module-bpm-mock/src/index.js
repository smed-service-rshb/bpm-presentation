import {mockRoute} from "@efr/medservice-web-presentation-utils-mock";
import {
    completeTaskURL,
    processInfoURL,
    startProcessURL,
    taskInfoURL,
    returnTasksURL,
    takeTasksURL,
} from "@efr/medservice-web-presentation-module-bpm/src/actions";

import processDefinitionsService from './ProcessDefinitionService'
import runtimeProcessService from './RuntimeProcessService'
import TasksAggregationMock from './TasksAggregationMock'

export const createTasksAggregationMock = () => ({registerMock}) => {
    registerMock(TasksAggregationMock());
};

export default (urlprefix, serviceName, buildProcessDefinition) => {
    buildProcessDefinition(processDefinitionsService.buildFor(serviceName));

    const START_PROCESS = ({success, error, request}) => {
        const processInstance = runtimeProcessService.startProcess(serviceName, request.params.processKey, {error, request});
        if (processInstance) {
            success(processInstance.buildInfo());
        }
    };

    const GET_PROCESS = ({success, error, request}) => {
        const processInstance = runtimeProcessService.getProcessInstance(request.params.id);
        if (!processInstance) {
            error(404, `Инстанс процесса с идентификатором  ${request.params.id} не найден`);
            return;
        }
        success(processInstance.buildInfo());
    };

    const GET_TASK = ({success, error, request}) => {
        const task = runtimeProcessService.getTask(request.params.id);
        if (!task) {
            error(404, `Зачада с идентификатором  ${request.params.id} не найдена`);
            return;
        }
        if (task.isCompleted()) {
            error(410, task.processInstance.buildInfo());
            return;
        }

        success(task.buildInfo());
    };

    const COMPLETE_TASK = ({success, error, request}) => {
        const processInstance = runtimeProcessService.complete(request.params.id,{error, request});
        if (processInstance) {
            success(processInstance.buildInfo());
        }
    };

    const RETURN_TASKS = ({success, error, request}) => {
        const taskIds = request.body;
        runtimeProcessService.returnTasks(taskIds, {success, error});
    };

    const TAKE_TASKS = ({success, error, request}) => {
        const {personnelNumber, office, taskIds} = request.body;
        runtimeProcessService.takeTasks(personnelNumber, office, taskIds, {success, error});
    };

    return [
        mockRoute.post(startProcessURL(urlprefix, ':processKey'), START_PROCESS),
        mockRoute.get(processInfoURL(urlprefix, ':id'), GET_PROCESS),
        mockRoute.get(taskInfoURL(urlprefix, ':id'), GET_TASK),
        mockRoute.post(completeTaskURL(urlprefix, ':id'), COMPLETE_TASK),
        mockRoute.put(returnTasksURL(urlprefix), RETURN_TASKS),
        mockRoute.put(takeTasksURL(urlprefix), TAKE_TASKS)
    ]
};