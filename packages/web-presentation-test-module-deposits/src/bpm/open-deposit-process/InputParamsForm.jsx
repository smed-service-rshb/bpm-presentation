import React from 'react';
import {Button, Form, Panel, Input, Field} from '@efr/medservice-web-presentation-ui';
import {compose, withModals} from "@efr/medservice-web-presentation-core";

class InputParamsForm extends React.Component {
    state = {};

    _setDepositName = name => {
        this.setState({name})
    };

    completeTask = (action) => () => {
        this.props.bpmTask.complete({name: this.state.name}, action)
            .catch(error => {
                this.props.modals.alert({title:`Ошибка завершении задачи: ${error.response.statusCode}`,message: `${JSON.stringify(error.response.body, null, 2)}`});
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
            <Panel label="Форма редактирования параметров открытия влада." dataId="deposit-params-panel">
                <Form buttons={fromButtons} dataId="deposit-params-form">
                    <Field required title="Название депозита">
                        <Input dataId="deposit-name-input" onChange={this._setDepositName} value={this.state.name}/>
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
)(InputParamsForm)
