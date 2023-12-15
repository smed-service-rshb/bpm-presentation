import bpmModuleMockConfig from '@efr/medservice-web-presentation-module-bpm-mock'
import {ClientServiceConstants} from '@efr/medservice-web-presentation-test-module-clients-mock'

import {
    CLIENT_CHECK_RESULT_CONTEXT_KEY,
    CLIENT_FIO_CONTEXT_KEY,
    CONFIRM_DEPOSIT_TASK_KEY,
    DEPOSIT_NAME_CONTEXT_KEY,
    INPUT_DEPOSIT_PARAMS_TASK_KEY,
    MODULE_NAME,
    OPEN_DEPOSIT_PROCESS_KEY
} from "@efr/medservice-web-presentation-test-module-deposits/src/constants";

const DepositsServiceProcessDefinitions = mockProcessDefinition => {
    mockProcessDefinition.createProcess(OPEN_DEPOSIT_PROCESS_KEY)
        .startEvent(({startSubprocess, request, error, context}) => {
            const {fio, clientId, systemId} = request.body;
            context.setSubject({clientId, systemId, "surName": 'Иванов', "firstName": 'Виктор', "middleName": 'Александрович'});
            if (!fio) {
                return error(400, {"message": "Введите ФИО клиента"})
            }
            context[CLIENT_FIO_CONTEXT_KEY] = fio;
            return startSubprocess(ClientServiceConstants.CHECK_CLIENT_SUBPROCESS_KEY, ClientServiceConstants.MODULE_NAME)
                .mapInputVariables(context => ({
                    [ClientServiceConstants.CLIENT_FIO_CONTEXT_KEY]: context[CLIENT_FIO_CONTEXT_KEY]
                }))
                .mapOutputVariables(context => ({
                    [CLIENT_CHECK_RESULT_CONTEXT_KEY]: context[ClientServiceConstants.CLIENT_CHECK_RESULT_CONTEXT_KEY] ? "Проверки пройдены" : "Проверки не пройдены"
                }))
                .onFinish(({subprocessContext, endProcess, success}) => {
                    if (subprocessContext[ClientServiceConstants.CLIENT_CHECK_RESULT_CONTEXT_KEY]) {
                        return success(INPUT_DEPOSIT_PARAMS_TASK_KEY);
                    }
                    return endProcess();
                })
        })
        .userTask(INPUT_DEPOSIT_PARAMS_TASK_KEY, ({request, context, error, success}) => {
            const name = request.body.name;
            if (!name) {
                return error(400, {"message": "Введите наименование депозита"})
            }
            context[DEPOSIT_NAME_CONTEXT_KEY] = name;
            return success(CONFIRM_DEPOSIT_TASK_KEY)
        })
        .userTask(CONFIRM_DEPOSIT_TASK_KEY, ({endProcess}) => endProcess());
};

export default () => ({registerMock}) => {
    registerMock(bpmModuleMockConfig(`/${MODULE_NAME}`, MODULE_NAME, DepositsServiceProcessDefinitions));
};
