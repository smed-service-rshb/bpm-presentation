import {compose} from "@efr/medservice-web-presentation-core";
import * as ExternalBPMs from "./src/external/bpms";
import * as ExternalPages from "./src/external/pages";

import moduleDefinition from "./src";

export default ({WithExternalBPMDependency, WithExternalPageDependency}) => compose(
    WithExternalBPMDependency(ExternalBPMs),
    WithExternalPageDependency(ExternalPages),
    moduleDefinition,
)
;
