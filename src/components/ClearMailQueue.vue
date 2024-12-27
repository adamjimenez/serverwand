<template>
    <div>
      <v-btn :loading="fetching" @click="deleteServer" v-bind="$attrs" :disabled="fetching || server?.queue == 0">
        Clear Mail Queue ({{ server?.queue ? server.queue : 0 }})
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
        if (!await this.$refs.confirm.open("Delete " + this.server?.queue + " items from the mail queue?")) {
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