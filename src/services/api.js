import axios from 'axios'
axios.defaults.withCredentials = true

import { setupCache } from 'axios-cache-adapter'

// Create `axios-cache-adapter` instance
const cache = setupCache({
    maxAge: 15 * 60 * 1000
})

const api = axios.create({
    adapter: cache.adapter
})

export default {
    get(path) {
        return api.get('https://serverwand.com/api/' + path);
    },
    post(path, payload) {
        return api.post('https://serverwand.com/api/' + path, payload);
    },
    event(path) {
        return new EventSource('https://serverwand.com/api/' + path, {withCredentials: true});
    },
    /*
    summary() {
        return axios.get('https://serverwand.com/api/summary');
    },
    servers() {
        return axios.get('https://serverwand.com/api/servers/');
    },
    */
    updateServer(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/update', payload);
    },
    deleteServer(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId + '/delete');
    },
    deleteServer(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId + '/delete');
    },
    /*
    saveCronjob(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/savecronjob', payload);
    },
    deleteCronjob(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/deletecronjob', payload);
    },
    saveSystemUser(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/savesystemuser', payload);
    },
    deleteSystemUser(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/deletesystemuser', payload);
    },
    firewall(serverId) {
        return axios.get('https://serverwand.com/api/servers/' + serverId + '/firewall');
    },
    setFirewallStatus(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/firewall', payload);
    },
    saveFirewallRule(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/savefirewallrule', payload);
    },
    deleteFirewallRule(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/deletefirewallrule', payload);
    },
    */
    fetchLog(serverId, payload) {
        return axios.post('https://serverwand.com/api/servers/' + serverId + '/fetchlog', payload);
    },
    /*
    saveAlias(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/savealias', payload);
    },
    deleteAlias(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/deletealias', payload);
    },
    */
    status(serverId) {
        return new EventSource('https://serverwand.com/api/servers/' + serverId + '/status');
    },
    /*
    domains() {
        return axios.get('https://serverwand.com/api/domains/');
    },
    domain(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId);
    },
    */
    createDomain(payload) {
        return axios.post('https://serverwand.com/api/domains/create', payload);
    },
    updateDomain(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/update', payload);
    },
    deleteDomain(domainId) {
        return axios.get('https://serverwand.com/api/domains/' + domainId + '/delete');
    },
    /*
    saveDatabase(domainId, payload) {
        return axios.post('https://serverwand.com/api/domains/' + domainId + '/savedatabase', payload);
    },
    */
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