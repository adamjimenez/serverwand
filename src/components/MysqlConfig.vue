<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn icon @click="edit()">
          <v-icon size="small">fas fa-wrench</v-icon>
        </v-btn>
      </template>
      <span>Configure MariaDB</span>
    </v-tooltip>

    <v-dialog v-model="drawer">
      <v-card>
        <v-card-title> Edit MariaDB config </v-card-title>

        <v-card-text>
          <v-textarea v-model="config" label="Config" auto-grow></v-textarea>

          <v-btn
            :disabled="fetching"
            :loading="fetching"
            color="success"
            @click="save"
          >
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../services/api";

export default {
  props: {
    serverId: null,
  },
  data() {
    return {
      fetching: false,
      config: "",
      drawer: false,
    };
  },

  methods: {
    edit() {
      var self = this;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/mariadb_config", {
          clearCacheEntry: true,
        })
        .then(response => {
          self.config = response.data.config;
          self.fetching = false;
          self.drawer = true;
        });
    },

    save() {
      var self = this;
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/mariadb_config", {
          config: self.config,
        })
        .then(() => {
            self.fetching=false;
            self.drawer=false;
          });
    },
  },
};
</script>