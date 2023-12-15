import React from 'react';
import {Button, Divider, Notification, Panel, Spreadsheet} from '@efr/medservice-web-presentation-ui';
import {compose, withActions, withAuthContext, withModals} from '@efr/medservice-web-presentation-core';
import {withBPM} from '@efr/medservice-web-presentation-module-bpm';
import {GetTasksBpm} from '../../../actions';
import {dateFromOffset, getFioOfClient, isUndefinedOrNull, openAlertMessage, sortByDateTimeISO} from "../../functions";
import Messages from '../../messages/Messages';

const resolveDefinitionKey = process => process && process.key;

const extractMainProcessKey = item => resolveDefinitionKey(item.superProcess) || resolveDefinitionKey(item.currentProcess);


class EmployeeTasksBpm extends React.Component {

    createFirstButton = (task, index, personnelNumber) => {
        return !isUndefinedOrNull(task.owner) && personnelNumber === task.owner.personnelNumber ? <Button dataId={`tasksTableButton${index}0`}
                      type={Button.buttonTypes.secondary}
                      name={'Исполнить'}
                      onClick={()=>this.performTask(task)}/>
            : <Button dataId={`tasksTableButton${index}0`}
                      type={Button.buttonTypes.secondary}
                      name={'Взять'}
                      onClick={()=>this.takeTask(task, this.initTasks)}/>
    };

    createSecondButton = (task, index, personnelNumber) => {
        return !isUndefinedOrNull(task.owner) && personnelNumber === task.owner.personnelNumber ? <Button dataId={`tasksTableButton${index}1`}
                      type={Button.buttonTypes.secondary}
                      name={'Вернуть'}
                      onClick={()=>this.returnTask(task)}/>
            : <Button dataId={`tasksTableButton${index}1`}
                      type={Button.buttonTypes.secondary}
                      name={'Взять и исполнить'}
                      onClick={()=>this.takeAndPerformTask(task)}/>
    };

    constructor(props) {
        super(props);
        this.state = {
            takenTasks: [],
            notTakenTasks: []
        };

        this.columns = [
            {"key": "process", "name": "ПРОЦЕСС", "data": task => task.currentProcess.name},
            {"key": "client", "name": "КЛИЕНТ", "data": task => getFioOfClient(task)},
            {"key": "task", "name": "ЗАДАЧА", "data": task => task.name},
            {"key": "createDate", "name": "ДАТА", "data": task => dateFromOffset(task.createDate)},
            {"key": "button_1", "name": "", "data": (task, index) => this.createFirstButton(task, index, this.props.authContext.userData.personnelNumber)},
            {"key": "button_2", "name": "", "data": (task, index) => this.createSecondButton(task, index, this.props.authContext.userData.personnelNumber)}
        ];
    }

    componentDidMount = () => {
        this.initTasks();
    };


    initTasks = () => {
        const {getTasksBpm} = this.props.actions;

        getTasksBpm("available").then(result => {
            result.sort(sortByDateTimeISO);
            const _takenTasks = [];
            const _notTakenTasks = [];
            result.forEach(item => {
                const {owner} = item;
                const isTakenTask = !isUndefinedOrNull(owner) && this.props.authContext.userData.personnelNumber === owner.personnelNumber;
                if(isTakenTask)
                    _takenTasks[_takenTasks.length] = item;
                else
                    _notTakenTasks[_notTakenTasks.length] = item;
            });
            this.setState({takenTasks: _takenTasks, notTakenTasks: _notTakenTasks})
        }).catch(error => {
            throw error
        })
    };

    render = () => {
        const {takenTasks, notTakenTasks} = this.state;
        return <Panel label={'Мои задачи'} dataId="bpm-tasks-owner">
            <Divider type={Divider.dividerTypes.default}/>
            {takenTasks.length !== 0 || notTakenTasks.length !== 0
                ? <Spreadsheet columns={this.columns} dataId="tasksTable" rows={takenTasks.concat(notTakenTasks)}/>
                : <Notification><p className='p-notification'>Вам не назначена ни одна задача</p></Notification>
            }
        </Panel>
    };

    performTask = item => {
        this.props.bpm.openTask({
            id: item.id,
            serviceName: item.currentProcess.moduleName,
            mainProcessKey: extractMainProcessKey(item),
        });
    };

    returnTask = task => {
        this.props.bpm.returnTasks(task.currentProcess.moduleName, [task.id]).then(()=>{
            this.initTasks();
        }).catch(error=>{
            if(error.response.statusCode === 400){
                this.alertOk(Messages.Alerts.notAssignedTaskMessage);
                this.initTasks();
            }
            if(error.response.statusCode === 409){
                this.alertOk(Messages.Alerts.reassignedTaskMessage);
                this.initTasks();
            }
        })
    };

    takeTask = (task, func)=> {
        this.props.bpm.takeTasks(task.currentProcess.moduleName, this.props.authContext.userData.personnelNumber, this.props.authContext.userData.office, [task.id]).then(() => {
            func(task);
        }).catch(error=>{
            if(error.response && error.response.statusCode === 409){
                this.alertOk(Messages.Alerts.assignedTaskMessage);
                this.initTasks();
            }
        })
    };

    takeAndPerformTask = task => {
        this.takeTask(task, this.performTask);
    };

    alertOk = openAlertMessage(this.props.modals.alert);
}

export default compose(
    withAuthContext,
    withModals(),
    withBPM,
    withActions({
        getTasksBpm: GetTasksBpm.name
    })
)(EmployeeTasksBpm);
