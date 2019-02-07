<template>
  <router-view></router-view>
</template>

<style>
.v-subheader {
  padding: 0;
}
</style>

<script>
  import axios from 'axios'

  export default {
    created () {

      axios.interceptors.response.use(function (response) {
        return response;
      }, function (error) {

        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          location.href = 'https://serverwand.com/login'
          return false
        }
      
        return Promise.reject(error);
      })
    }
  }
</script>