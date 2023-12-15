import devDefinition, {TestPages} from './src';
import {bpmRelation as bpm} from "@efr/medservice-web-presentation-module-bpm";
import AuthModuleDefinition from '@efr/medservice-web-presentation-authentication/dependency';
import TasksAggregationModuleDefinition from '@efr/medservice-web-presentation-bpm-tasks-aggregation/dependency';
import clientsModule, {ClientModulePages} from "@efr/medservice-web-presentation-test-module-clients";
import {
    WithExternalActionDependency,
    WithExternalPageDependency,
    WithExternalModalDependency,
    WithoutExternalDependency
} from "@efr/medservice-web-presentation-utils-dev";
import {
    WithExternalBPMDependency
} from "@efr/medservice-web-presentation-module-bpm-dev";
import {PageKeys} from '@efr/medservice-web-presentation-bpm-tasks-aggregation';

const navigation = menuItem => ([
    menuItem(`Поиск клиента`, 'search-clients-page').toPage({
        key: ClientModulePages.searchClientsPage.key,
        related: [
            bpm('create-client-process'),
        ],
    }),
    menuItem(`Тест процесса открытия вклада`, 'bpm-test-page').toPage({
        key: TestPages.bpmTestPage.key,
        related: [
            bpm('open-deposit-process'),
        ]
    }),
    menuItem('Задачи', 'menuItemTasks').withChildren([
        menuItem('Мои задачи', 'subMenuItemEmployeeTasks').toPage({
            key: PageKeys.EMPLOYEE_TASKS_BPM_PAGE_KEY
        }),
        menuItem('Задачи подразделения', 'subMenuItemUnitTasks').toPage({
            key: PageKeys.BRANCH_TASKS_BPM_PAGE_KEY
        })
    ])
]);

const dependencyCheckers = {
    WithExternalActionDependency,
    WithExternalPageDependency,
    WithExternalModalDependency,
    WithoutExternalDependency,
    WithExternalBPMDependency,
};

const aggregationDependencies = {
    clientsService: {
        serviceName: 'clients-service'
    },
    depositsService: {
        serviceName: 'deposits-service'
    }
};

const modules = [
    devDefinition,
    AuthModuleDefinition(dependencyCheckers),
    clientsModule,
    TasksAggregationModuleDefinition(aggregationDependencies, dependencyCheckers)
];

export default {
    navigation,
    modules,
}
