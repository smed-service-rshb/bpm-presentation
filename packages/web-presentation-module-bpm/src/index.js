import {buildActions} from './actions'
import {buildPages} from './pages';
import withBPM from './withBPM'
import bpmRelation from './bpmRelation'

export {withBPM}
export {bpmRelation}

export default (urlPrefix, moduleName, processDefinitions) => args => {
    if (!args) {
        console.log(`Не получен конфигуратор модуля для определения bmp [${moduleName}] (проверь возврат аргумента в функции определения модуля).`);
        throw new Error('Ошибка конфигурирования модуля.');
    }

    const {action, page} = args;

    const pages = buildPages(moduleName, processDefinitions);

    Object.keys(pages).forEach(pageDescription => {
        page(pages[pageDescription]);
    });

    const actions = buildActions(moduleName, urlPrefix);

    Object.keys(actions).forEach(actionDescription => {
        action(actions[actionDescription]);
    });

    return args;
};