import {compose} from '@efr/medservice-web-presentation-core';

import {
    serviceNameFieldResolver,
    actionDependency,
    pageDependency,
    withDependency
} from '@efr/medservice-web-presentation-utils-dev';

import {
    generateBPMProcessPageKey,
    generateBPMTaskPageKey
} from "@efr/medservice-web-presentation-module-bpm/src/pages/page-keys";

import {
    generateCompleteTaskActionName,
    generateProcessInfoActionName,
    generateStartProcessActionName,
    generateTaskInfoActionName,
    generateReturnTasksActionName,
    generateTakeTasksActionName,
} from "@efr/medservice-web-presentation-module-bpm/src/actions";

const bpmResourceDependency = dependency => value => resource => dependency(resource(value));
const bpmActionDependency = bpmResourceDependency(actionDependency);
const bpmPageDependency = bpmResourceDependency(pageDependency);

const bpmActions = [
    generateStartProcessActionName,
    generateTaskInfoActionName,
    generateCompleteTaskActionName,
    generateProcessInfoActionName,
    generateReturnTasksActionName,
    generateTakeTasksActionName
];

const bpmPages = [
    generateBPMProcessPageKey,
    generateBPMTaskPageKey,
];

const bpmDependency = value => compose(
    ...bpmActions.map(bpmActionDependency(value)),
    ...bpmPages.map(bpmPageDependency(value)),
);

export const WithExternalBPMDependency = withDependency(bpmDependency, serviceNameFieldResolver('bpm'));
