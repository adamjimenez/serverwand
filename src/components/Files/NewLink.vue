<template>
    <div>
      <v-btn @click="open()" title="New folder" icon="mdi:mdi-link"></v-btn>
      <v-dialog app v-model="dialog" max-width="600">
        <v-card :loading="fetching" title="New link">
          <v-card-text>
            <v-text-field v-model="data.value" label="name" autofocus></v-text-field>
            <v-text-field v-model="data.dest" label="destination path"></v-text-field>
            <v-btn color="primary" @click="save" :disabled="data.value === ''">
              Save
            </v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import api from "../../services/api";
  
  export default {
    props: {
      serverId: null,
      path: null,
    },
  
    watch: {
      path: function (newVal) {
        this.data.path = newVal
      },
    },
  
    data() {
      return {
        fetching: false,
        dialog: false,
        data: {
          value: "",
          dest: "",
        },
      };
    },
  
    created() {
      this.data.path = this.path
    },
  
    methods: {
      open() {
        this.data.value = ""
        this.dialog = true
      },
      save() {
        this.error = ""
        this.fetching = true
        this.loading = true
  
        api
          .post("servers/" + this.serverId + "/files", {
            cmd: 'new_link',
            new_link: this.data.value,
            dest: this.data.dest
          })
          .then(response => {
            console.log(response)
  
            if (response.data.success) {
              this.dialog = false;
              this.$emit("complete");
            } else {
              let error = response.data.error
                ? response.data.error
                : response.data;
  
                this.$emit("error", error);
            }
          })
          .catch(error => console.log(error))
          .finally(() => {
            this.fetching = false
            this.loading = false
          })
      },
    },
  };
  </script>