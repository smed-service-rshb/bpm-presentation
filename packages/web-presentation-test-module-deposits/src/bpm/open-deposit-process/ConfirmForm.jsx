import React from 'react';
import {Button, Form, Panel, Field} from '@efr/medservice-web-presentation-ui';
import {compose, withModals} from "@efr/medservice-web-presentation-core";

import {CLIENT_FIO_CONTEXT_KEY, CLIENT_CHECK_RESULT_CONTEXT_KEY, DEPOSIT_NAME_CONTEXT_KEY} from './constants'

class ConfirmForm extends React.Component {
    completeTask = (action) => () => {
        this.props.bpmTask.complete({}, action)
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
            <Panel label="Форма подтвержления открытия вклада." dataId="confirm-open-deposit-panel">
                <Form buttons={fromButtons} dataId="confirm-open-deposit-form">
                    <Field title="ФИО клиента">{this.props.bpmContext[CLIENT_FIO_CONTEXT_KEY]}</Field>
                    <Field
                        title="Результат проверки клиента">{this.props.bpmContext[CLIENT_CHECK_RESULT_CONTEXT_KEY]}</Field>
                    <Field title="Название депозита">{this.props.bpmContext[DEPOSIT_NAME_CONTEXT_KEY]}</Field>
                    Информация о задаче:
                    <pre>{JSON.stringify(this.props.bpmTask, null, 2)}</pre>
                </Form>
            </Panel>
        )
    };
}

export default compose(
    withModals(),
)(ConfirmForm)

