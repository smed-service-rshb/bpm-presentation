import {compose} from "@efr/medservice-web-presentation-core";

import bpmPlugin from "@efr/medservice-web-presentation-module-bpm";
import {MODULE_NAME} from './constants'
import ProcessDefinitions from './bpm';

const moduleDefinition = arg => {
    const {name} = arg;

    name(MODULE_NAME);

    return arg;
};

export default compose(
    bpmPlugin(`/${MODULE_NAME}`, MODULE_NAME, ProcessDefinitions),
    moduleDefinition,
);
