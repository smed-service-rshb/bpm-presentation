import {EMPLOYEE_TASKS_BPM_PAGE_KEY, BRANCH_TASKS_BPM_PAGE_KEY} from '../page-keys'
import './styles.css'
import EmployeeTasksBpm from "./EmployeeTasksBpm";
import BranchTasksBpm from "./BranchTasksBpm";
import {Rights} from "@efr/medservice-web-presentation-authentication";

export const EmployeeTasksBpmPage = {
    key: EMPLOYEE_TASKS_BPM_PAGE_KEY,
    path: '/tasks/employee',
    component: EmployeeTasksBpm,

    availability: authContext => authContext.checkPermission(Rights.TASKS_SELF_MANAGEMENT_IN_DIVISION) ||
                                 authContext.checkPermission(Rights.TASKS_SELF_MANAGEMENT_IN_FILIAL)
};

export const BranchTasksBpmPage = {
    key: BRANCH_TASKS_BPM_PAGE_KEY,
    path: '/tasks/branch',
    component: BranchTasksBpm,

    availability: authContext => authContext.checkPermission(Rights.TASKS_SELF_MANAGEMENT_IN_DIVISION) ||
                                 authContext.checkPermission(Rights.TASKS_SELF_MANAGEMENT_IN_FILIAL) ||
                                 authContext.checkPermission(Rights.TASKS_MANAGEMENT)
};