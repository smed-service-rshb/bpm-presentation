import React from 'react';

import {compose, PropTypes, withActions, withPageRouter,} from '@efr/medservice-web-presentation-core';
import {withPreloader} from "@efr/medservice-web-presentation-ui";

import {generateProcessInfoActionName} from '../actions'
import {generateBPMProcessPageKey} from './page-keys'

import BPMLayout, {setupLayout} from './bpmLayout'
import ErrorComponent from './Error'
import {backToLauncherPage, handleProcessResponse, openTaskPage, openProcessPage} from "../utils";

const createBPMProcessComponent = (moduleName, processDefinitionsRegistry) => {
    class BPMProcessComponent extends React.Component {
        state = {};
        handleProcess = processInfo => {
            if (processInfo.id !== this.props.id || processInfo.serviceName !== moduleName) {
                openProcessPage(this.props.pageRouter)(processInfo);
            }
            else {
                this.setState({processInfo})
            }
        };
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
                .then(handleProcessResponse(
                    props.getAction,
                    props.preloader,
                    openTaskPage(props.pageRouter),
                    this.handleProcess
                ))
                .catch(error => {
                    console.error(error);
                    this.setState({error});
                })
        );

        render = () => {
            const {error, processInfo} = this.state;
            if (error) {
                return <ErrorComponent message={"Операция временно недоступна."}/>;
            }
            if (!processInfo) {
                return null;
            }
            processInfo.backToLauncherPage = () => backToLauncherPage(this.props.pageRouter, processDefinitionsRegistry, processInfo);

            const BPMComponent = processDefinitionsRegistry.getDefaultProcessComponent(processInfo.definitionKey);
            if (!BPMComponent) {
                return <ErrorComponent
                    message={`Ошибка. Не объявлен компонент по умолчанию для процесса ${processInfo.definitionKey}.`}/>;
            }
            return <BPMComponent bpmProcess={processInfo} bpmContext={processInfo.variables}/>
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
                getInfo: generateProcessInfoActionName(moduleName),
            }
        ),
        withPreloader
    )(BPMProcessComponent)
};


export default (moduleName, processDefinitionsRegistry) => ({
    key: generateBPMProcessPageKey(moduleName),
    path: `/${moduleName}/bpm/process/:id`,
    component: createBPMProcessComponent(moduleName, processDefinitionsRegistry),

    availability: ({authenticated}) => authenticated,
});