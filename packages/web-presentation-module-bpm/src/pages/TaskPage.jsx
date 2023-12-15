import React from 'react';
import {compose, PropTypes, ResponseStatus, withActions, withPageRouter} from '@efr/medservice-web-presentation-core';
import {withPreloader} from "@efr/medservice-web-presentation-ui";

import {generateCompleteTaskActionName, generateTaskInfoActionName} from '../actions'
import {backToLauncherPage, processProcessResponse} from "../utils";
import BPMLayout, {setupLayout} from './bpmLayout'
import {generateBPMTaskPageKey} from './page-keys'

import ErrorComponent from './Error'

const createBPMTaskComponent = (moduleName, processDefinitionsRegistry) => {
        class BPMTaskComponent extends React.Component {
            state = {};

            handleProcessResponse = processProcessResponse(this.props.pageRouter, this.props.getAction, this.props.preloader);

            componentDidMount = () => {
                this._fetchData(this.props);
            };

            UNSAFE_componentWillUpdate  = nextProps => {
                if (nextProps.id !== this.props.id) {
                    this._fetchData(nextProps);
                }
            };

            _fetchData = props => (
                props.actions.getInfo(props.id)
                    .then(setupLayout(props.setLayoutData))
                    .then(data => {
                        this.setState({taskInfo: data});
                    })
                    .catch(ResponseStatus.gone(this.handleProcessResponse))
                    .catch(error => {
                        console.error(error);
                        this.setState({error});
                    })
            );

            complete = (data, action) => (
                this.props.actions.complete(this.props.id, data)
                    .then(action || this.handleProcessResponse)
            );

            backToLauncherPage = registry => process => backToLauncherPage(this.props.pageRouter, registry, process);

            buildBPMTask = () => {
                const {taskInfo} = this.state;
                if (!taskInfo) {
                    return null;
                }
                return {
                    ...taskInfo,
                    complete: this.complete,
                    backToLauncherPage: this.backToLauncherPage(processDefinitionsRegistry)
                }
            };

            render = () => {
                const {error} = this.state;
                if (error) {
                    return <ErrorComponent message={"Операция временно недоступна."}/>;
                }
                const bpmTask = this.buildBPMTask();
                if (!bpmTask) {
                    return null;
                }
                const processKey = bpmTask.processInfo.definitionKey;
                const BPMComponent = processDefinitionsRegistry.getComponent(processKey, bpmTask.definitionKey);
                if (!BPMComponent) {
                    throw new Error(`Не объявлен компонент для задачи ${bpmTask.definitionKey} процесса ${processKey}.`);
                }
                return <BPMComponent bpmTask={bpmTask} bpmContext={bpmTask.variables}/>
            };

            static propTypes = {
                id: PropTypes.string,
                mainProcessKey: PropTypes.string,
            };
        }

        return compose(
            BPMLayout,
            withPageRouter,
            withActions(
                {
                    getInfo: generateTaskInfoActionName(moduleName),
                    complete: generateCompleteTaskActionName(moduleName),
                }
            ),
            withPreloader
        )(BPMTaskComponent)
    }
;


export default (moduleName, processDefinitionsRegistry) => ({
    key: generateBPMTaskPageKey(moduleName),
    path: `/${moduleName}/bpm/task/:id`,
    component: createBPMTaskComponent(moduleName, processDefinitionsRegistry),

    availability: ({authenticated}) => authenticated,
});