export const generateStartProcessActionName = moduleName => `bpm.${moduleName}.startProcess`;
export const generateTaskInfoActionName = moduleName => `bpm.${moduleName}.tackInfo`;
export const generateCompleteTaskActionName = moduleName => `bpm.${moduleName}.completeTack`;
export const generateProcessInfoActionName = moduleName => `bpm.${moduleName}.processInfo`;
export const generateReturnTasksActionName = moduleName => `bpm.${moduleName}.returnTasks`;
export const generateTakeTasksActionName = moduleName => `bpm.${moduleName}.takeTasks`;

export const startProcessURL = (urlPrefix, processDefinitionKey) => `${urlPrefix}/bpm/process/definition/${processDefinitionKey}/start`;
export const processInfoURL = (urlPrefix, id) => `${urlPrefix}/bpm/process/${id}`;
export const taskInfoURL = (urlPrefix, id) => `${urlPrefix}/bpm/task/${id}`;
export const completeTaskURL = (urlPrefix, id) => `${urlPrefix}/bpm/task/${id}/complete`;
export const returnTasksURL = urlPrefix => `${urlPrefix}/bpm/task/owner/return`;
export const takeTasksURL = urlPrefix => `${urlPrefix}/bpm/task/owner/take`;

const startProcess = urlPrefix => ({RestClient}, key, data) => {
    return RestClient
        .post(startProcessURL(urlPrefix, key), data)
        .then(response => response.body)
};

const getProcessInfo = urlPrefix => ({RestClient}, id) => {
    return RestClient
        .get(processInfoURL(urlPrefix, id))
        .then(response => response.body)
};

const getTaskInfo = urlPrefix => ({RestClient}, id) => {
    return RestClient
        .get(taskInfoURL(urlPrefix, id))
        .then(response => response.body)
};

const completeTask = urlPrefix => ({RestClient}, id, data) => {
    return RestClient
        .post(completeTaskURL(urlPrefix, id), data)
        .then(response => response.body)
};

const returnTasks = urlPrefix => ({RestClient}, taskIds) => {
    return RestClient
        .put(returnTasksURL(urlPrefix))
        .send(taskIds)
        .then(response => response.body)
};

const takeTasks = urlPrefix => ({RestClient}, personnelNumber, office, taskIds) => {
    return RestClient
        .put(takeTasksURL(urlPrefix))
        .send({personnelNumber: personnelNumber, office: office, taskIds: taskIds})
        .then(response => response.body)
};

const createStartProcessAction = (moduleName, urlPrefix) => ({
    name: generateStartProcessActionName(moduleName),
    action: startProcess(urlPrefix)
});

const createProcessInfoAction = (moduleName, urlPrefix) => ({
    name: generateProcessInfoActionName(moduleName),
    action: getProcessInfo(urlPrefix)
});

const createTaskInfoAction = (moduleName, urlPrefix) => ({
    name: generateTaskInfoActionName(moduleName),
    action: getTaskInfo(urlPrefix)
});

const createCompleteTaskAction = (moduleName, urlPrefix) => ({
    name: generateCompleteTaskActionName(moduleName),
    action: completeTask(urlPrefix)
});

const createReturnTasksAction = (moduleName, urlPrefix) => ({
    name: generateReturnTasksActionName(moduleName),
    action: returnTasks(urlPrefix)
});

const createTakeTasksAction = (moduleName, urlPrefix) => ({
    name: generateTakeTasksActionName(moduleName),
    action: takeTasks(urlPrefix)
});

export const buildActions = (moduleName, urlPrefix) => ({
    START_PROCESS: createStartProcessAction(moduleName, urlPrefix),
    PROCESS_INFO: createProcessInfoAction(moduleName, urlPrefix),
    TACK_INFO: createTaskInfoAction(moduleName, urlPrefix),
    COMPLETE_TASK: createCompleteTaskAction(moduleName, urlPrefix),
    RETURN_TASKS: createReturnTasksAction(moduleName, urlPrefix),
    TAKE_TASKS: createTakeTasksAction(moduleName, urlPrefix)
});