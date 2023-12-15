import React from 'react';
import {Button, Form, Panel, Field, Toggle} from '@efr/medservice-web-presentation-ui';
import {compose, withModals} from "@efr/medservice-web-presentation-core";

import {CLIENT_FIO_CONTEXT_KEY} from './constants'

class CheckClientForm extends React.Component {
    state = {};
    _setCheckResult = checkResult => {
        this.setState({checkResult})

    };

    completeTask = (action) => () => {
        this.props.bpmTask.complete({checkResult: this.state.checkResult}, action)
            .catch(error => {
                this.props.modals.alert({
                    title: `Ошибка завершении задачи: ${error.response.statusCode}`,
                    message: `${JSON.stringify(error.response.body, null, 2)}`
                });
            });
    };

    render = () => {
        const fromButtons = [
            <Button key="save"
                    name="Продолжить"
                    dataId="completeTask-save"
                    onClick={this.completeTask()}/>,
            <Button key="saveAndBack"
                    name="Завершить задачу и вернуться к странице, запустившей процесс"
                    dataId="completeTask-save-and-back"
                    onClick={this.completeTask(this.props.bpmTask.backToLauncherPage)}/>
        ];
        return (
            <Panel label="Форма проверки клиента." dataId="check-client-panel">
                <Form buttons={fromButtons} dataId="check-client-form">
                    <Field title="ФИО клиента">{this.props.bpmContext[CLIENT_FIO_CONTEXT_KEY]}</Field>
                    <Field required title="Клиент прошел проверки?">
                        <Toggle dataId="check-client-toggle" onChange={this._setCheckResult}
                                checked={this.state.checkResult} description="Ставим дружно флаг!"/>
                    </Field>
                    Информация о задаче:
                    <pre>{JSON.stringify(this.props.bpmTask, null, 2)}</pre>
                </Form>
            </Panel>
        )
    };
}

export default compose(
    withModals(),
)(CheckClientForm)

