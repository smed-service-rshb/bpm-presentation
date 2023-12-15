import createBPMTaskPage from './TaskPage'
import createBPMProcessPage from './ProcessPage'
import {buildProcessDefinitionsRegistry} from "../utils";

export const buildPages = (moduleName, processDefinitions) => {
    const processDefinitionsRegistry = buildProcessDefinitionsRegistry(processDefinitions);
    return {
        BPMTaskPage: createBPMTaskPage(moduleName, processDefinitionsRegistry),
        BPMProcessPage: createBPMProcessPage(moduleName, processDefinitionsRegistry),
    }
};

export * as PageKeys from './page-keys'
