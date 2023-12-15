const getTasksBpm = ({RestClient}, type) => {
    return RestClient
        .get(`/aggregation/bpm/task`)
        .query({
            type: type
        }).then(response => response.body)
};

export const GetTasksBpm = {
    name: 'bpm.task',
    action: getTasksBpm
};