import axios from 'axios'

axios.defaults.withCredentials = true; 

export default {
    summary() {
        return axios.get('https://serverwand.com/api/summary');
    },
    servers() {
        return axios.get('https://serverwand.com/api/servers');
    },
    server(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId);
    },
    createServer(payload) {
        return axios.post('https://serverwand.com/api/servers/create', payload);
    },
    updateServer(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/update', payload);
    },
    installWebserver(serverId) {
        return new EventSource('https://serverwand.com/api/servers/' + serverId + '/installwebserver', {withCredentials: true});
    },
    deleteServer(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId + '/delete');
    },
    deleteServer(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId + '/delete');
    },
    saveSystemUser(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/savesystemuser', payload);
    },
    deleteSystemUser(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/deletesystemuser', payload);
    },
    fetchLog(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/fetchlog', payload);
    },
    saveAlias(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/savealias', payload);
    },
    deleteAlias(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/deletealias', payload);
    },
    status(serverId) {
        return new EventSource('https://serverwand.com/api/servers/' + serverId + '/status');
    },
    domains() {
        return axios.get('https://serverwand.com/api/domains');
    },
    domain(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId);
    },
    createDomain(payload) {
        return axios.post('https://serverwand.com/api/domains/create', payload);
    },
    updateDomain(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/update', payload);
    },
    enableSSL(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId + '/enablessl');
    },
    deleteDomain(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId + '/delete');
    },
    saveDatabase(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/savedatabase', payload);
    },
    installWordpress(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId + '/installwordpress');
    },
    login(payload) {
        return axios.post('https://serverwand.com/api/auth/login', payload);
    },
    register(payload) {
        return axios.post('https://serverwand.com/api/auth/register', payload);
    },
    forgot(payload) {
        return axios.post('https://serverwand.com/api/auth/forgot', payload);
    },
    profile() {
        return axios.get('https://serverwand.com/api/settings/profile');
    },
    update(payload) {
        return axios.post('https://serverwand.com/api/settings/profile', payload);
    },
    logout() {
        return axios.post('https://serverwand.com/api/auth/logout');
    },
}