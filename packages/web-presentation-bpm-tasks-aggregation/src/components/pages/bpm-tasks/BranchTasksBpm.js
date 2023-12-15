import React from 'react';
import {Button, Checkbox, Divider, Panel, Spreadsheet} from '@efr/medservice-web-presentation-ui';
import {compose, withActions, withAuthContext, withModals} from '@efr/medservice-web-presentation-core';
import {withBPM} from '@efr/medservice-web-presentation-module-bpm';
import {GetTasksBpm} from '../../../actions';
import {Rights} from "@efr/medservice-web-presentation-authentication";
import {
    getFamilyIO,
    isUndefinedOrNull,
    openAlertMessage,
    sortByDateTimeISO,
    sortByOwner,
    dateFromOffset,
    getFioOfClient
} from "../../functions";
import {EmployeePopup} from "../../popups";
import './styles.css'
import {GetEmployeesListAction} from "../../../actions/external";
import Messages from "../../messages/Messages";

class BranchTasksBpm extends React.Component {

    checkedDataOnChange = (row, index) => selected => {
        const tasksCopy = this.state.tasks;
        tasksCopy[index].checked = selected;
        this.setState({
            tasks: tasksCopy
        })
    };

    columns = [
        {"key": "checked", "name": "",
            data: (task, index) => <Checkbox onChange={this.checkedDataOnChange(task, index)} checked={task.checked} dataId={`data-checkbox${index}`}/>,
        },
        {"key": "process", "name": "ПРОЦЕСС", "data": task => task.currentProcess.name},
        {"key": "client", "name": "КЛИЕНТ", "data": task => getFioOfClient(task)},
        {"key": "task", "name": "ЗАДАЧА", "data": task => task.name},
        {"key": "createDate", "name": "ДАТА", "data": task => dateFromOffset(task.createDate)},
        {"key": "dueDate", "name": "СРОК", "data": task => dateFromOffset(task.dueDate)},
        {"key": "owner", "name": "ИСПОЛНИТЕЛЬ", "data": task => getFamilyIO(task.owner)}
    ];

    state = {
        tasks: []
    };

    componentDidMount = () => {
        this.initTasks();
    };

    initTasks = () => {
        const {getTasksBpm} = this.props.actions;
        getTasksBpm("office").then(result => {
            result.sort((a, b) => {
                const compare = sortByOwner(a.owner, b.owner);
                return compare !== 0 ? compare : sortByDateTimeISO(a, b);
            });
            this.setState({tasks: result.map(row=>{
                    row.checked = false;
                    return row;
                })})
        }).catch(error => {
            throw error
        })
    };

    showError = error => {
        if (error.response && error.response.statusCode === 400) {
            this.alertOk(Messages.Alerts.notAssignedTaskMessage);
        }
        if (error.response && error.response.statusCode === 409) {
            this.alertOk(Messages.Alerts.assignedTaskMessage)
        }
    };

    claimTask = (serviceName, employeeData, tasks) => {
        this.props.bpm.takeTasks(serviceName, employeeData.personnelNumber, employeeData.office, tasks.map(task=>task.id))
            .catch(this.showError);
    };

    unClaimTask = (serviceName, tasks) => {
        this.props.bpm.returnTasks(serviceName, tasks.map(task=>task.id))
            .catch (this.showError);
    };

    showErrorWithInitTask = error => {
        if (error.response && error.response.statusCode === 400) {
            this.alertOk(Messages.Alerts.notAssignedTaskMessage);
        }
        if (error.response && error.response.statusCode === 409) {
            this.alertOk(Messages.Alerts.assignedTaskMessage);
        }
        this.initTasks();
    };

    breakdownServicesTask = tasks => {
        const serviceTasks = {};
        for (let i = 0; i < tasks.length; i++) {
            const serviceName = tasks[i].currentProcess.moduleName;
            if (!serviceTasks[serviceName]) {
                serviceTasks[serviceName] = [];
            }
            serviceTasks[serviceName].push(tasks[i]);
        }
        return serviceTasks;
    };

    render = () => {
        const {tasks} = this.state;
        return <Panel label={'Задачи подразделения'} dataId="bpm-tasks-owner">
            <Divider type={Divider.dividerTypes.default}/>
            {this.props.authContext.checkPermission(Rights.TASKS_MANAGEMENT)&& <div className='buttons-before-table'>
                <Button dataId={`tasksTableButtonReturnTask`}
                        type={Button.buttonTypes.specialOrange}
                        name={'Вернуть'}
                        onClick={() => this.changesTasks(
                            this.returnTasks,
                            ()=>this.alertOk(Messages.Alerts.reassignedTaskMessage)
                        )}
                        disabled={this.disableReturnButton()}
                />
                <Button dataId={`tasksTableButtonPerformTask`}
                        type={Button.buttonTypes.specialOrange}
                        name={'Переназначить'}
                        onClick={this.openEmployeePopup}
                        disabled={this.disablePerformButton()}
        />
            </div>}
            <Spreadsheet columns={this.columns} dataId="tasksTable"
                rows={tasks}/>
        </Panel>
    };

    openEmployeePopup = () => {
        this.props.actions.getEmployeesListAction({office: this.props.authContext.userData.office})
            .then(result => {
                this.props.modals.employeeModal(result)
                    .on('success', response => {
                        const {employee} = response;
                        const employeeData = {};
                        employeeData.personnelNumber = employee.personnelNumber;
                        employeeData.office = employee.office;
                        this.changesTasks(
                            this.reassignTask(employeeData)
                        )
                    })
            })
            .catch(er => {throw er});
    };

    changesTasks = func => {
        Promise.resolve(func(this.state.tasks.filter(item=>item.checked).filter(item=>item.checked))).then(()=>{
            this.initTasks();
        }).catch(this.showErrorWithInitTask);
    };

    returnTasks = tasks => {
        const serviceTasks = this.breakdownServicesTask(tasks);
        for (const serviceName in serviceTasks) {
            if (serviceTasks.hasOwnProperty(serviceName)) {
                this.unClaimTask(serviceName, serviceTasks[serviceName]);
            }
        }
    };

    reassignTask = employeeData => tasks => {
        const serviceTasks = this.breakdownServicesTask(tasks);
        for (const serviceName in serviceTasks) {
            if (serviceTasks.hasOwnProperty(serviceName)) {
                this.claimTask(serviceName, employeeData, serviceTasks[serviceName]);
            }
        }
    };

    alertOk = openAlertMessage(this.props.modals.alert);

    disableReturnButton = () => {
        const {tasks} = this.state;
        let hasChecked = false;
        for(let i = 0; i < tasks.length; i++) {
            if (tasks[i].checked) {
                if(isUndefinedOrNull(tasks[i].owner)){
                    return true;
                }
                hasChecked = true;
            }
        }
        return !hasChecked;
    };

    disablePerformButton = () => {
        const {tasks} = this.state;
        for(let i = 0; i < tasks.length; i++){
            if(tasks[i].checked){
                return false;
            }
        }
        return true;
    }
}

export default compose(
    withAuthContext,
    withModals({
        employeeModal: EmployeePopup.key
    }),
    withBPM,
    withActions({
        getTasksBpm: GetTasksBpm.name,
        getEmployeesListAction: GetEmployeesListAction.name
    })
)(BranchTasksBpm);