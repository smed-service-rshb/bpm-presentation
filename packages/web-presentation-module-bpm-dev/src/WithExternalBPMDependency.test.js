import bpmPlugin from "@efr/medservice-web-presentation-module-bpm";
import {
    generateStartProcessActionName,
    generateTaskInfoActionName,
    generateCompleteTaskActionName,
    generateProcessInfoActionName,
    generateReturnTasksActionName,
    generateTakeTasksActionName
} from "@efr/medservice-web-presentation-module-bpm/src/actions";
import {
    generateBPMTaskPageKey,
    generateBPMProcessPageKey,
} from "@efr/medservice-web-presentation-module-bpm/src/pages/page-keys";


import {
    WithExternalBPMDependency
} from './index';


import {compose} from '@efr/medservice-web-presentation-core';

import DevModulesBuilder, {IGNORE_DEPENDENCY_ARGUMENT} from '@efr/medservice-web-presentation-utils-dev/src/dev-app/DevModulesBuilder';

const EMPTY_CALLBACK = () => {
};

const checkResources = (expectedResources, actualResources, keyField) => {
    expect(actualResources.length).toBe(expectedResources.length);
    const checkedResources = {};
    expectedResources.forEach(expectedResource => {
        expect(expectedResource[keyField]).toBeDefined();
        expect(checkedResources[expectedResource[keyField]]).toBeUndefined();
        checkedResources[expectedResource[keyField]] = actualResources.find(resource => expectedResource[keyField] === resource[keyField]);
        expect(checkedResources[expectedResource[keyField]]).toBeDefined();
    });
};

const checkAvailable = (consumer, expectedResources, actualResources, resourceResolver, keyField) => {
    const available = resourceKey => {
        expect(() => {
            resourceResolver(resourceKey, consumer);
        }).not.toThrowError();
        return true;
    };
    const unavailable = resourceKey => {
        global.console = {error: jest.fn()};
        resourceResolver(resourceKey, consumer);
        expect(global.console.error).toBeCalled();
        return true;
    };

    actualResources.forEach(resource => {
        const resourceKey = resource[keyField];
        (expectedResources.includes(resourceKey) ? available : unavailable)(resourceKey);
    });
};

const definition = (testingDefinition, dependency = (_) => (_)) => {
    let providerDefinition = () => {
    };

    const providerPages = [];
    const providerActions = [];
    const providerModals = [];

    let testModuleName;

    const testingDefinitionWithDependency = compose(
        dependency,
        testingDefinition,
    );

    testingDefinitionWithDependency({
        name: name => {
            testModuleName = name;
        },
        page: EMPTY_CALLBACK,
        action: EMPTY_CALLBACK,
        modal: EMPTY_CALLBACK,
        ...IGNORE_DEPENDENCY_ARGUMENT,
    });

    const definitionResult = {
        withProvider: provider => {
            providerDefinition = provider;

            provider({
                name: EMPTY_CALLBACK,
                page: page => providerPages.push(page),
                action: action => providerActions.push(action),
                modal: modal => providerModals.push(modal),
                ...IGNORE_DEPENDENCY_ARGUMENT,
            });

            return definitionResult;
        },
        build: () => {
            let resolve;
            try {
                const data = DevModulesBuilder([testingDefinitionWithDependency, providerDefinition]);
                resolve = () => data;
            } catch (e) {
                resolve = () => {
                    throw e;
                }
            }

            const resultChecker = {
                resources: ({expectedPages = [], expectedActions = [], expectedModals = [], page = [], action = [], modal = []}) => {
                    const buildResult = resolve();
                    checkResources([...providerPages, ...expectedPages, ...page], buildResult.pages, 'key');
                    checkResources([...providerActions, ...expectedActions, ...action], buildResult.actions, 'name');
                    checkResources([...providerModals, ...expectedModals, ...modal], buildResult.modals, 'key');
                },
                available: ({actions: expectedActions = [], modals: expectedModals = [], bpms: expectedBPMs = [], pages: expectedPages = []}) => {
                    const buildResult = resolve();
                    const bpmActions = [];
                    const bpmPages = [];
                    expectedBPMs.forEach(bpm => {
                        bpmActions.push(generateStartProcessActionName(bpm));
                        bpmActions.push(generateTaskInfoActionName(bpm));
                        bpmActions.push(generateCompleteTaskActionName(bpm));
                        bpmActions.push(generateProcessInfoActionName(bpm));
                        bpmActions.push(generateReturnTasksActionName(bpm));
                        bpmActions.push(generateTakeTasksActionName(bpm));
                        bpmPages.push(generateBPMTaskPageKey(bpm));
                        bpmPages.push(generateBPMProcessPageKey(bpm));
                    });
                    checkAvailable(testModuleName, [...bpmActions, ...expectedActions], buildResult.actions, buildResult.actionResolver, 'name');
                    checkAvailable(testModuleName, expectedModals, buildResult.modals, buildResult.modalResolver, 'key');
                    checkAvailable(testModuleName, [...bpmPages, ...expectedPages], buildResult.pages, buildResult.pageResolver, 'key');
                }
            };

            return {
                expect: {
                    success: () => expect(resolve).not.toThrowError() && resultChecker,
                    error: () => expect(resolve).toThrowError(),
                    ...resultChecker,
                },
            };
        },
    };

    return definitionResult;
};

const resourceProvider = provider => {
    const moduleName = `${provider.name}-provider-module`;
    const sharedResourceName = `shared-${provider.name}`;
    const privateResourceName = `private-${provider.name}`;
    let sharedResource = provider(sharedResourceName);
    const result = define => {
        define.name(moduleName);
        sharedResource.register(define);
        provider(privateResourceName).register(define);
        return define;
    };
    result.sharedResourceName = sharedResourceName;
    result.sharedResource = sharedResource.item;
    return result;
};
const bpm = serviceName => {
    return {
        item: {serviceName},
        register: bpmPlugin(`/${serviceName}`, serviceName, []),
    };
};
const bpmProvider = resourceProvider(bpm);

const EMPTY_MODULE = define => {
    define.name('test-module');
    return define;
};

describe('WithExternalBPMDependency check', () => {
    const providedResourceDependency = WithExternalBPMDependency({shared: bpmProvider.sharedResource});
    const notProvidedResourceDependency = WithExternalBPMDependency({shared: bpmProvider.sharedResource});
    test(`with bpms dependency => ok`, () => {
        definition(EMPTY_MODULE, providedResourceDependency)
            .withProvider(bpmProvider).build().expect.success();
    });
    test(`with not provided bpms dependency => error`, () => {
        definition(EMPTY_MODULE, WithExternalBPMDependency(notProvidedResourceDependency))
            .build().expect.error();
    });
    test(`check bpms availability`, () => {
        definition(EMPTY_MODULE, providedResourceDependency)
            .withProvider(bpmProvider).build().expect.available({bpms: [bpmProvider.sharedResourceName]});
    });
});
