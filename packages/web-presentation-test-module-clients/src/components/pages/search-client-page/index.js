import React from 'react';
import {compose, PropTypes} from "@efr/medservice-web-presentation-core";
import {Button} from "@efr/medservice-web-presentation-ui";
import {withBPM} from '@efr/medservice-web-presentation-module-bpm';
import {MODULE_NAME, CREATE_CLIENT_PROCESS_KEY} from '../../../constants'

class SearchClientsPage extends React.Component {
    createClient = () => {
        this.props.bpm.startProcess(MODULE_NAME, CREATE_CLIENT_PROCESS_KEY, {
            "systemId": "BISQUIT:6300"
        })
    };

    render = () => (
        <div>
            {
                this.props.clientName && <div>
                    В параметрах пришло: clientName = '{this.props.clientName}'
                </div>
            }
            <Button key="createClient"
                    dataId="button-create-client"
                    name="Создать клиента"
                    onClick={this.createClient}
            />
        </div>
    );

    static propTypes = {
        clientName: PropTypes.string,
    };
}

const PageComponent = compose(
    withBPM,
)(SearchClientsPage);

export const searchClientsPage = {
    key: "search-clients-page",
    path: '/clients-search',
    component: PageComponent,

    availability: ({authenticated}) => authenticated,
};
