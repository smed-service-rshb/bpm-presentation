import {GetTasksBpm} from "./actions";
import {compose} from "@efr/medservice-web-presentation-core";
import {BranchTasksBpmPage, EmployeeTasksBpmPage} from "./components/pages/bpm-tasks";
import {EmployeePopup} from "./components";

const moduleName = 'bpm-aggregation-service';


const moduleDefinition = args => {

    const {name, action, page, modal} = args;
    name(moduleName);

    page(EmployeeTasksBpmPage);
    page(BranchTasksBpmPage);

    modal(EmployeePopup);

    action(GetTasksBpm);

    return args;
};

export default compose(
    moduleDefinition
);

export {moduleName}

export {PageKeys} from './components'