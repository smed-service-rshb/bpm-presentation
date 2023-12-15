import {BPMTestPage} from '../../external/pages';

import {
    OPEN_DEPOSIT_PROCESS_KEY,
    INPUT_DEPOSIT_PARAMS_TASK_KEY,
    CONFIRM_DEPOSIT_TASK_KEY
} from "./constants";

import ProcessDetailsForm from './ProcessDetailsForm'
import InputParamsForm from './InputParamsForm'
import ConfirmForm from './ConfirmForm'

const fallBackLauncherPage = {
    key: BPMTestPage.key,
};

const openDepositProcessDefinition = ({processDefinition}) => {
    processDefinition(OPEN_DEPOSIT_PROCESS_KEY, ProcessDetailsForm, fallBackLauncherPage)
        .userTaskComponent(INPUT_DEPOSIT_PARAMS_TASK_KEY, InputParamsForm)
        .userTaskComponent(CONFIRM_DEPOSIT_TASK_KEY, ConfirmForm)
};

export {openDepositProcessDefinition}
