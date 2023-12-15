import {generateBPMLauncherPageKey, generateBPMProcessPageKey, generateBPMTaskPageKey} from './pages/page-keys'
import {generateProcessInfoActionName} from './actions'

const GET_PROCESS_INFO_REPEAT_COUNT = 60; // количесво повторений запроса информации о процессе, если он без задач и находится в состояниии WAITING_ASYNC
const GET_PROCESS_INFO_REPEAT_DALEY = 1000; // задержка между повторениями запроса информации о процессе, если он без задач и находится в состояниии WAITING_ASYNC

const resolveDefinitionKey = process => process && process.definitionKey;

const extractMainProcessKey = process => resolveDefinitionKey(process.superProcess) || resolveDefinitionKey(process);

const goToBPMPage = (pageRouter, generateBPMPageKey, {serviceName, id, mainProcessKey}) => pageRouter.open(generateBPMPageKey(serviceName), {
    id,
    mainProcessKey,
});

export const openProcessPage = pageRouter => process => goToBPMPage(pageRouter, generateBPMProcessPageKey, {
    serviceName: process.serviceName,
    id: process.id,
    mainProcessKey: extractMainProcessKey(process),
});

export const openTaskPage = pageRouter => task => goToBPMPage(pageRouter, generateBPMTaskPageKey, task);

export const getProcessInfo = getAction => process => getAction(generateProcessInfoActionName(process.serviceName))(process.id);

const handleProcessResponseInternal = (handleTask, handleProcess, handleWaitingAsync) => process => {
    if (process.activeUserTask) {
        return handleTask({
            ...process.activeUserTask,
            mainProcessKey: extractMainProcessKey(process),
        });
    } else if (process.finished && !process.superProcess) {
        return handleProcess(process); //завершен основной процесс
    } else if (process.finished && process.superProcess) {
        return handleProcess(process.superProcess); // завершен дочерний процесс
    } else if (process.executionState.includes("WAITING_ASYNC")) {
        return handleWaitingAsync(process)
    } else if (!process.activeUserTask) {
        return handleProcess(process.superProcess ? process.superProcess : process);
    } else {
        console.log(`Обработать ${process}`) //TODO есть "USER_TASK", "FAILED_JOB"
        return null
    }
};

export const handleProcessResponse = (getAction, preloader, handleTask, handleProcess) => {
    let i = 0;
    const handleWaitingAsync = process => {
        if (++i > GET_PROCESS_INFO_REPEAT_COUNT) {
            return null
        }
        preloader.show();
        return new Promise(s => setTimeout(s, GET_PROCESS_INFO_REPEAT_DALEY))
            .then(() => getProcessInfo(getAction)(process))
            .then(handleProcessResponseInternal(handleTask, handleProcess, handleWaitingAsync))
            .then(data => {
                preloader.hide();
                return data
            })
            .catch(e => {
                preloader.hide();
                throw e
            })
    };

    return handleProcessResponseInternal(handleTask, handleProcess, handleWaitingAsync);
};

export const processProcessResponse = (pageRouter, getAction, preloader) => handleProcessResponse(
    getAction,
    preloader,
    openTaskPage(pageRouter),
    openProcessPage(pageRouter)
);
const componentKey = (process, taskKey) => (`process:${process}, task:${taskKey}`);

export const buildProcessDefinitionsRegistry = (processDefinitions = []) => {
    const components = {};
    const defaultComponents = {};
    const fallBackLauncherPages = {};
    const processDefinition = (processKey, defaultComponent, fallBackLauncherPage) => {
        if (!defaultComponent) {
            throw new Error(`Необходимо задать дефолтный компонент для процесса ${processKey}.`)
        }
        if (!fallBackLauncherPage) {
            console.warn(`Рекомендуется задать дефолтную стартовую страницу для процесса ${processKey}.`)
        }

        if (defaultComponents[processKey]) {
            throw new Error(`Дефолтный компонент для процесса ${processKey} уже зарегистрирован.`)
        }
        defaultComponents[processKey] = defaultComponent;

        if (fallBackLauncherPages[processKey]) {
            throw new Error(`Дефолтная страница, с которой запускается процесс ${processKey}, уже зарегистрирована.`)
        }
        fallBackLauncherPages[processKey] = fallBackLauncherPage;
        return {
            userTaskComponent(definitionKey, component) {
                const key = componentKey(processKey, definitionKey);
                if (!defaultComponent) {
                    throw new Error(`Необходимо задать дефолтный компонент с ключом ${definitionKey}.`)
                }
                if (components[key]) {
                    throw new Error(`Компонент с ключом ${key} уже зарегистрирован.`)
                }
                components[key] = component;
                return this;
            }
        }
    };

    const subprocessDefinition = subprocessKey => ({
        userTaskComponent(definitionKey, component) {
            const key = componentKey(subprocessKey, definitionKey);
            if (components[key]) {
                throw new Error(`Компонент с ключом ${key} уже зарегистрирован.`)
            }
            components[key] = component;
            return this;
        }
    });

    processDefinitions.forEach(definition => {
        definition({processDefinition, subprocessDefinition})
    });
    return {
        getComponent(processKey, taskKey) {
            return components[componentKey(processKey, taskKey)]
        },
        getDefaultProcessComponent(processKey) {
            return defaultComponents[processKey];
        },
        getFallBackLauncherPage(processKey) {
            return fallBackLauncherPages[processKey];
        },
    }
};

const mapContextToPageParams = (fallBackLauncherPage, process) => {
    if (!fallBackLauncherPage) {
        return fallBackLauncherPage;
    }

    if (fallBackLauncherPage.paramsToContextMapping) {
        console.error(`Параметр 'paramsToContextMapping' (${fallBackLauncherPage}) не поддерживается (см. 'paramsResolver').`);
    }

    const paramsResolver = fallBackLauncherPage.paramsResolver || (({subject}) => ({...subject}));
    return {
        key: fallBackLauncherPage.key,
        params: paramsResolver(process)
    };
};

export const backToLauncherPage = (pageRouter, registry, process) => {
    const fallBackLauncherPage = mapContextToPageParams(registry.getFallBackLauncherPage(process.definitionKey), process);
    const callback = !fallBackLauncherPage
        ? (() => {
            console.error(`Для процесса не указана дефолтная стартовая страница.`);
            return pageRouter.openIndex();
        })
        : (() => pageRouter.open(fallBackLauncherPage.key, fallBackLauncherPage.params));
    return pageRouter.back(
        generateBPMLauncherPageKey(process.id), //если сохранилась метка для страницы начала процесса - переходим на нее
        callback //иначе переходим на дефолтную стартовую страницу процесса
    );
};
