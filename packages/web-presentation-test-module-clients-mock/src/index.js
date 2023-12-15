import bpmModuleMockConfig from '@efr/medservice-web-presentation-module-bpm-mock'

import {
    MODULE_NAME,
    CREATE_CLIENT_PROCESS_KEY,
    CHECK_CLIENT_SUBPROCESS_KEY,
    EDIT_CLIENT_DATA_TASK_KEY,
    CHECK_CLIENT_DATA_TASK_KEY,
    CONFIRM_CLIENT_DATA_TASK_KEY,

    CLIENT_FIO_CONTEXT_KEY,
    CLIENT_CHECK_RESULT_CONTEXT_KEY
} from "@efr/medservice-web-presentation-test-module-clients/src/constants";

const ClientServiceProcessDefinitions = mockProcessDefinition => {
    mockProcessDefinition.createProcess(CREATE_CLIENT_PROCESS_KEY)
        .startEvent(({success, request, context}) => {
            context["SYSTEM_ID"] = request.body.systemId;
            context.setSubject({"id": "1", "systemId": request.body.systemId, "surName": 'Иванов', "firstName": 'Виктор', "middleName": 'Александрович'});
            return success(EDIT_CLIENT_DATA_TASK_KEY)
        })
        .userTask(EDIT_CLIENT_DATA_TASK_KEY, ({request, error, context, startSubprocess}) => {
            const fio = request.body.fio;
            if (!fio) {
                return error(400, {"message": "Введите фио клиента"})
            }
            context[CLIENT_FIO_CONTEXT_KEY] = fio;
            return startSubprocess(CHECK_CLIENT_SUBPROCESS_KEY)
                .inputVariables(CLIENT_FIO_CONTEXT_KEY)
                .mapOutputVariables(context => ({
                    [CLIENT_CHECK_RESULT_CONTEXT_KEY]: context[CLIENT_CHECK_RESULT_CONTEXT_KEY] ? "Проверки пройдены" : "Проверки не пройдены"
                }))
                .onFinish(CONFIRM_CLIENT_DATA_TASK_KEY)
        })
        .userTask(CONFIRM_CLIENT_DATA_TASK_KEY, ({endProcess}) => endProcess());

    mockProcessDefinition.createSubprocess(CHECK_CLIENT_SUBPROCESS_KEY)
        .startEvent(({success}) => success(CHECK_CLIENT_DATA_TASK_KEY))
        .userTask(CHECK_CLIENT_DATA_TASK_KEY, ({endProcess, request, context}) => {
            context[CLIENT_CHECK_RESULT_CONTEXT_KEY] = !!request.body.checkResult;
            return endProcess()
        })
};

export default () => ({registerMock}) => {
    registerMock(bpmModuleMockConfig(`/${MODULE_NAME}`, MODULE_NAME, ClientServiceProcessDefinitions));
};

export const ClientServiceConstants = {
    MODULE_NAME,
    CHECK_CLIENT_SUBPROCESS_KEY,
    CHECK_CLIENT_DATA_TASK_KEY,

    CLIENT_FIO_CONTEXT_KEY,
    CLIENT_CHECK_RESULT_CONTEXT_KEY
};