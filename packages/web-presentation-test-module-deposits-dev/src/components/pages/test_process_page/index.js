import React from 'react';
import {compose, PropTypes, withModals} from "@efr/medservice-web-presentation-core";
import {Button, Field, Input} from "@efr/medservice-web-presentation-ui";
import {withBPM} from '@efr/medservice-web-presentation-module-bpm';
import {MODULE_NAME, OPEN_DEPOSIT_PROCESS_KEY} from '@efr/medservice-web-presentation-test-module-deposits/src/constants'

class BpmTestPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fio:"Иванов Петр",
            clientId: props.clientId || '007',
            systemId: props.systemId || 'MI6',
        };
    }

    _setClientFIO = fio => {
        this.setState({fio})
    };

    _setClientId = clientId => {
        this.setState({clientId})
    };

    _setClientSystem = systemId => {
        this.setState({systemId})
    };

    openDeposit = () => {
        const {fio, clientId, systemId} = this.state;
        this.props.bpm.startProcess(MODULE_NAME, OPEN_DEPOSIT_PROCESS_KEY, {fio, clientId, systemId})
            .catch(error => {
                this.props.modals.alert({
                    title: `Ошибка завершении задачи: ${error.response.statusCode}`,
                    message: `${JSON.stringify(error.response.body, null, 2)}`
                });
            });
    };

    render = () => {
        return (
            <div>
                <Field required title="ФИО клиента">
                    <Input dataId="client-fio-input" onChange={this._setClientFIO} value={this.state.fio}/>
                </Field>
                <Field required title="Id клиента">
                    <Input dataId="client-id-input" onChange={this._setClientId} value={this.state.clientId}/>
                </Field>
                <Field required title="System клиента">
                    <Input dataId="client-system-input" onChange={this._setClientSystem} value={this.state.systemId}/>
                </Field>
                <Button key="openDeposit"
                        dataId="button-open-deposit"
                        name="Открыть вклад"
                        onClick={this.openDeposit}
                />
            </div>
        )
    };

    static propTypes = {
        clientId: PropTypes.string,
        systemId: PropTypes.string,
    };
}

const PageComponent = compose(
    withBPM,
    withModals(),
)(BpmTestPage);

export const bpmTestPage = {
    key: "bpm-test-page",
    path: '/bpm-test-page',
    component: PageComponent,

    availability: ({authenticated}) => authenticated,
};
