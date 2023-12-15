import moment from 'moment';

export const getFamilyIO = persona => {
    if (persona) {
        const surName = !!persona.surName ? persona.surName : '';
        const firstName = !!persona.firstName ? ' ' + persona.firstName[0] + '.' : '';
        const middleName = !!persona.middleName ? ' ' + persona.middleName[0] + '.' : '';
        return surName + firstName + middleName;
    }
    return '';
};

export const getFioOfClient = task => {
    const client = task.client;
    if (client) {
        return getFamilyIO(client);
    }
    if (task){
        if (task.currentProcess.key === "ClientCreateProcess") {
            return "Новый клиент";
        }
    }
    return '';
};


export const dateFromOffset = offsetdate => {
    if (!offsetdate) {
        return undefined;
    } else {
        const date = offsetdate.substring(0, 10);
        const time = ' ' + offsetdate.substring(11, 19);
        return moment( date, 'YYYY-MM-DD',true).format('DD.MM.YYYY') + time;
    }
}

export const sortByDateTimeISO = (a, b) => {
    const dateA = dateFromOffset(a.createDate);
    const dateB = dateFromOffset(b.createDate);
    if (dateA === dateB) {
        return 0;
    }
    return dateA > dateB ? 1: -1;
};

const compareString = (s1, s2) => {
    if (s1 === s2) {
        return 0;
    }
    return s1 < s2 ? -1 : 1;
}

export const sortByOwner = (a, b) => {
    if (a === null && b !== null)
        return 1;
    if (a !== null && b === null)
        return -1;
    if(a === null)
        return 0;

    let compare = compareString(a.surName, b.surName);
    if(compare !== 0)
        return compare;
    compare = compareString(a.firstName, b.firstName);
    if(compare !== 0)
        return compare;
    compare = compareString(a.middleName, b.middleName);
    if(compare !== 0)
        return compare;
    return 0;
};

export const dateFromISO = date => date ? moment( date, 'YYYY-MM-DD',true).format('DD.MM.YYYY') : undefined;


export const isUndefinedOrNull = value => value === undefined || value === null;

export const openAlertMessage = alertModal => message =>{
    alertModal({okButtonName:'OK', message: message})
};