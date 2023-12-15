import React from 'react';
import {Button, Form, Panel} from '@efr/medservice-web-presentation-ui';

class ProcessDetailsForm extends React.Component {
    render = () => {
        const formButtons = [
            <Button key="back"
                    name="ОK"
                    dataId="back"
                    onClick={this.props.bpmProcess.backToLauncherPage}/>
        ];
        return (
            <Panel label="Форма просмотра информации о процессе открытия вклада." dataId="open-deposit-process-panel">
                <Form buttons={formButtons} dataId="create-person-process-form">
                    Информация о процессе:
                    <pre>{JSON.stringify(this.props.bpmProcess, null, 2)}</pre>
                </Form>
            </Panel>
        )
    }
}

export default ProcessDetailsForm;
