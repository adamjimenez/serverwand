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

    <v-dialog v-model="drawer" max-width="600">
      <v-card>
        <v-card-title> Edit MariaDB config </v-card-title>

        <v-card-text>
          <v-textarea v-model="config" label="Config" auto-grow></v-textarea>

          <v-btn :disabled="fetching" :loading="fetching" color="success" @click="save">
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
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/mariadb_config", {
          clearCacheEntry: true,
        })
        .then(response => {
          this.config = response.data.config;
          this.fetching = false;
          this.drawer = true;
        });
    },

    save() {
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/mariadb_config", {
          config: this.config,
        })
        .then(() => {
          this.fetching = false;
          this.drawer = false;
        });
    },
  },
};
</script>