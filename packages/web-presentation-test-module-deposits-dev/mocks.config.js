import createAuthModuleMock from '@efr/medservice-web-presentation-authentication-mock'
import createDepositModuleMock from '@efr/medservice-web-presentation-test-module-deposits-mock'
import createClientsModuleMock from '@efr/medservice-web-presentation-test-module-clients-mock'
import {createTasksAggregationMock} from '@efr/medservice-web-presentation-module-bpm-mock'

export default () => ({externalMock}) => {
    externalMock(createAuthModuleMock());
    externalMock(createClientsModuleMock());
    externalMock(createDepositModuleMock());
    externalMock(createTasksAggregationMock());
};
