import {compose} from "@efr/medservice-web-presentation-core";
import {GetEmployeesListAction} from "./src/actions/external";

import moduleDefinition from "./src";

export default (externalBPMs, {WithExternalActionDependency, WithExternalBPMDependency}) => compose(
    WithExternalBPMDependency(externalBPMs),
    WithExternalActionDependency({GetEmployeesListAction}),
    moduleDefinition,
);