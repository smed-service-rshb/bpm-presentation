import {compose} from "@efr/medservice-web-presentation-core";
import {WithExternalPageDependency} from "@efr/medservice-web-presentation-utils-dev";
import {WithExternalBPMDependency} from "@efr/medservice-web-presentation-module-bpm-dev";

import devDefinition from '@efr/medservice-web-presentation-test-module-deposits/dependency';

import {TestPages} from './components';

const devAppModuleDefinition = arg => {
    const {page} = arg;

    Object.keys(TestPages).forEach(pageDescription => {
        page(TestPages[pageDescription]);
    });

    return arg;
};

export {TestPages};

export default compose(
    devAppModuleDefinition, // расширяем целевой модуль
    devDefinition({WithExternalPageDependency, WithExternalBPMDependency}), //dev-определение модуля (с указанием зависимостей)
);

