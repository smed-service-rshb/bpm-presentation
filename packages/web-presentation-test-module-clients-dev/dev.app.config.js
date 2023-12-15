import devDefinition from './src';
import {bpmRelation as bpm} from "@efr/medservice-web-presentation-module-bpm";
import {ClientModulePages} from '@efr/medservice-web-presentation-test-module-clients';
import AuthModuleDefinition from '@efr/medservice-web-presentation-authentication';
import {PageKeys} from '@efr/medservice-web-presentation-bpm-tasks-aggregation';

import {
    WithExternalActionDependency,
    WithExternalPageDependency,
    WithExternalModalDependency,
    WithoutExternalDependency
} from "@efr/medservice-web-presentation-utils-dev";

import {
    WithExternalBPMDependency
} from "@efr/medservice-web-presentation-module-bpm-dev";

import tasksAggregationModule from '@efr/medservice-web-presentation-bpm-tasks-aggregation/dependency';

const navigation = menuItem => ([
    menuItem(`Поиск клиента`, 'search-clients-page').toPage({
        key: ClientModulePages.searchClientsPage.key,
        related: [
            bpm('create-client-process'),
        ],
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
    }
};

const modules = [
    devDefinition,
    AuthModuleDefinition,
    tasksAggregationModule(aggregationDependencies, dependencyCheckers)
];

export default {
    navigation,
    modules,
}
