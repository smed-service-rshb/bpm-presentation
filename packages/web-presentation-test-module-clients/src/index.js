import {compose} from "@efr/medservice-web-presentation-core";

import bpmPlugin from "@efr/medservice-web-presentation-module-bpm";
import {MODULE_NAME} from './constants'
import ProcessDefinitions from './bpm';
import {ClientModulePages} from './components';

const moduleDefinition = arg => {
    const {name, page} = arg;

    name(MODULE_NAME);

    Object.keys(ClientModulePages).forEach(pageDescription => {
        page(ClientModulePages[pageDescription]);
    });

    return arg;
};

export default compose(
    bpmPlugin(`/${MODULE_NAME}`, MODULE_NAME, ProcessDefinitions),
    moduleDefinition,
);

export {ClientModulePages};