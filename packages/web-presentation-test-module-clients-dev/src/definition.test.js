import {checkDefinition} from '@efr/medservice-web-presentation-utils-test';
import config from '../dev.app.config.js';

describe('Definition', () => {
    test('check with dependencies', () => {
        checkDefinition(config.modules);
    });
});
