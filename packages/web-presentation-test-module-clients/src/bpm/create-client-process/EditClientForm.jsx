import React from 'react';
import {Button, Form, Panel, Input, Field} from '@efr/medservice-web-presentation-ui';
import {compose, withModals} from "@efr/medservice-web-presentation-core";

class EditClientForm extends React.Component {
    state = {};

    _setClientFIO = fio => {
        this.setState({fio})
    };

    completeTask = (action) => () => {
        this.props.bpmTask.complete({fio: this.state.fio}, action)
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
            <Panel label="Форма редактирования клиента." dataId="client-edit-panel">
                <Form buttons={fromButtons} dataId="client-edit-form">
                    <Field required title="ФИО клиента">
                        <Input dataId="client-fio-input" onChange={this._setClientFIO} value={this.state.fio}/>
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
)(EditClientForm)
