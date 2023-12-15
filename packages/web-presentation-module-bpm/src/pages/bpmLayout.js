import {
    layouts,
} from '@efr/medservice-web-presentation-core';

export const setupLayout = setLayoutData => process => {
    setLayoutData({...process.subject});
    return process;
};

export default layouts.ManuallySetupMenuDataLayout;
