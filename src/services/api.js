import axios from 'axios'
axios.defaults.withCredentials = true

import { setup } from 'axios-cache-adapter'

// Create `axios-cache-adapter` instance
const cache = setup({
    maxAge: 15 * 60 * 1000,
    cache: {
      // Invalidate only when a specific option is passed through config
      invalidate: async (config, request) => {
        if (request.clearCacheEntry) {
          await config.store.removeItem(config.uuid)
        }
      }
    }
})

const api = axios.create({
    adapter: cache.adapter
})

api.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    const originalRequest = error.config;

    if (!error.response || error.response.status === 401 && !originalRequest._retry) {
        location.href = 'https://serverwand.com/login'
        return false
    }

    return Promise.reject(error);
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
    }
}