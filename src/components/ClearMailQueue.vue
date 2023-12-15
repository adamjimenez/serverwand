<template>
    <div>
      <v-btn :disabled="fetching" :loading="fetching" @click="deleteServer">
        Clear Mail Queue
      </v-btn>
      <Confirm ref="confirm" />
    </div>
  </template>
  
  <script>
  import api from "../services/api";
  import Confirm from "./ConfirmDialog.vue";
  
  export default {
    components: {
      Confirm,
    },
  
    props: {
      server: null,
    },
  
    data() {
      return {
        fetching: false,
      };
    },
  
    methods: {
      deleteServer: async function () {
        if (!await this.$refs.confirm.open("Clear Mail Queue for " + this.server.name + "?")) {
          return;
        }
        
        this.fetching = true;
  
        api
          .get("servers/" + this.$route.params.id + "/clearmailqueue")
          .then(response => {
            console.log(response.data.result);
            this.$emit('complete', response.data.result);
          })
          .catch((error) => console.log(error))
          .finally(() => this.fetching = false);
      }
    },
  }
  </script>