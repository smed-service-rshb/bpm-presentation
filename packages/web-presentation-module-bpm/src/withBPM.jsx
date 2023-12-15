import React from 'react';

import {compose, withActions, withPageRouter} from '@efr/medservice-web-presentation-core';
import {withPreloader} from "@efr/medservice-web-presentation-ui";

import {
    generateStartProcessActionName,
    generateReturnTasksActionName,
    generateTakeTasksActionName,
    generateTaskInfoActionName
} from './actions'
import {processProcessResponse, openTaskPage} from "./utils";
import {generateBPMLauncherPageKey} from './pages/page-keys'

const startProcess = (pageRouter, getAction, preloader) => (moduleName, key, data) => {
    const action = getAction(generateStartProcessActionName(moduleName));
    return action(key, data).then(process => {
        pageRouter.markPage(generateBPMLauncherPageKey(process.id));
        return processProcessResponse(pageRouter, getAction, preloader)(process);
    });
};

const returnTasks = getAction => (moduleName, taskIds) => {
    const action = getAction(generateReturnTasksActionName(moduleName));
    return action(taskIds);
};

const takeTasks = getAction => (moduleName, personnelNumber, office, taskIds) => {
    const action = getAction(generateTakeTasksActionName(moduleName));
    return action(personnelNumber, office, taskIds);
};

const getTaskInfo = getAction => (moduleName, id) => {
    const action = getAction(generateTaskInfoActionName(moduleName));
    return action(id);
};

const withBPM = Component => {

    return class C extends React.Component {
        constructor(props) {
            super(props);
            this.bpm = ({
                startProcess: startProcess(props.pageRouter, props.getAction, this.props.preloader),
                returnTasks: returnTasks(props.getAction),
                takeTasks: takeTasks(props.getAction),
                getTaskInfo: getTaskInfo(props.getAction),
                openTask: openTaskPage(props.pageRouter),
            });
        }

        render = () => <Component {...this.props} bpm={this.bpm}/>;

        static displayName = `withBPM(${Component.displayName || Component.name})`;
        static WrappedComponent = Component;

        static propTypes = Component.propTypes;
        static defaultProps = Component.defaultProps;
    }
};

export default compose(
    withPageRouter,
    withActions(),
    withBPM,
    withPreloader
)
//TODO покрыть тестами