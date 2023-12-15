import {
    CLIENT_FIO_CONTEXT_KEY,
    CREATE_CLIENT_PROCESS_KEY,
    CHECK_CLIENT_SUBPROCESS_KEY,
    EDIT_CLIENT_DATA_TASK_KEY,
    CHECK_CLIENT_DATA_TASK_KEY,
    CONFIRM_CLIENT_DATA_TASK_KEY
} from "./constants";

import ProcessDetailsForm from './ProcessDetailsForm'
import EditClientForm from './EditClientForm'
import CheckClientForm from './CheckClientForm'
import ConfirmClientForm from './ConfirmClientForm'

import {ClientModulePages} from '../../components'

const fallBackLauncherPage = {
    key: ClientModulePages.searchClientsPage.key,
    paramsResolver: ({variables}) => ({
        clientName: variables[CLIENT_FIO_CONTEXT_KEY],
    }),
};

const createClientProcessDefinition = ({processDefinition}) => {
    processDefinition(CREATE_CLIENT_PROCESS_KEY, ProcessDetailsForm, fallBackLauncherPage)
        .userTaskComponent(EDIT_CLIENT_DATA_TASK_KEY, EditClientForm)
        .userTaskComponent(CONFIRM_CLIENT_DATA_TASK_KEY, ConfirmClientForm)
};

const checkClientSubprocessDefinition = ({subprocessDefinition}) => {
    subprocessDefinition(CHECK_CLIENT_SUBPROCESS_KEY)
        .userTaskComponent(CHECK_CLIENT_DATA_TASK_KEY, CheckClientForm)
};

export {
    createClientProcessDefinition,
    checkClientSubprocessDefinition
}
