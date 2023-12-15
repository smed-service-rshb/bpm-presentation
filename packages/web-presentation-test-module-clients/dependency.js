import {compose} from "@efr/medservice-web-presentation-core";

import moduleDefinition from "./src";

export default ({WithoutExternalDependency}) => compose(
    WithoutExternalDependency,
    moduleDefinition,
);
