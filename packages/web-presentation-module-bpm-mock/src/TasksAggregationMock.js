import {mockRoute} from "@efr/medservice-web-presentation-utils-mock";
import runtimeProcessService from "./RuntimeProcessService";

const isUndefinedOrNull = value => value === undefined || value === null;

const tasksAggregationMock = () => {

    const GET_BPM_TASKS = ({success, request}) => {
        const tasks = runtimeProcessService.getTasks();
        const type = request.query.type;
        const _tasks = [];
        Object.keys(tasks).forEach(id => {
            const task = tasks[id];
            if(!task.isCompleted() && (type === 'office' || (isUndefinedOrNull(task.owner) || task.owner.personnelNumber === "N79000000000"))){
                _tasks[_tasks.length] = task.buildAggregationInfo();
            }
        });

        success(_tasks);
    };

    return [
        mockRoute.get('/aggregation/bpm/task', GET_BPM_TASKS),
    ]
};

export default tasksAggregationMock