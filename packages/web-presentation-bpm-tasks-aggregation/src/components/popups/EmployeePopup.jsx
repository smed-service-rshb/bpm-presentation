import React from 'react';
import {compose, modal, withFormData} from '@efr/medservice-web-presentation-core';
import {
    Button,
    RadioButton,
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from '@efr/medservice-web-presentation-ui';
import {PropTypes} from "@efr/medservice-web-presentation-core/src/index";

class EmployeePopup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            employee: props.employees[0]
        };
        this.fromButtons = [
            <Button key="ok"
                    name="Выбор"
                    dataId="button-select"
                    onClick={this.handleSelect}/>,
            <Button key="cancel"
                    dataId="button-cancel"
                    name="Отменить"
                    onClick={this.handleCancel}
                    type={Button.buttonTypes.secondary}/>
        ];
    }

    render = () => {
        const styleFirstHeader = {
            'textAlign': 'left'
        };
        const tableRows = this.props.employees.map((item, index) => <TableRow dataId={`tableRow${index}`}
                                                                              key={index}
                                                                              onClick={() => this.select(item)}>
            <TableRowColumn dataId={`tableColumn0${index}`}>
                    <RadioButton checked={this.checked(item)}
                                 onChange={()=>{}}
                                 dataId={`radio-button` + item.id}/>
                    <span>{item.fullName}</span>
            </TableRowColumn>
        </TableRow>);
        return <modal.window buttons={this.fromButtons}>
            <Table net={"horizontal"}>
                <TableHeader>
                    <TableRow onClick={this.handleChangeRowColor} dataId={"tableHeaderRow"}>
                        <TableHeaderColumn dataId={"tableHeader0"} style={styleFirstHeader}>
                            {'ФИО СОТРУДНИКА'}
                        </TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableRows}
                </TableBody>
            </Table>
        </modal.window>;
    };

    handleSelect = () => {
        this.props.modal.close('success', {employee: this.state.employee})
    };

    handleCancel = () => {
        this.props.modal.close()
    };

    checked = value => value === this.state.employee;

    select = value => {
        this.setState({employee: value})
    };
}

EmployeePopup.PropTypes = {
    employees: PropTypes.array.isRequired
};

export default compose(
    withFormData,
    modal(true)
)(EmployeePopup);