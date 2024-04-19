<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn icon @click="edit()">
          <v-icon size="small">fas fa-wrench</v-icon>
        </v-btn>
      </template>
      <span>Configure Time Zone</span>
    </v-tooltip>

    <v-dialog v-model="drawer">
      <v-card>
        <v-card-title> Edit Time Zone </v-card-title>

        <v-card-text>

          <v-select v-model="timeZone" :items="timeZones" label="Time Zone"></v-select>

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
      timeZone: "",
      timeZones: [],
      drawer: false,
    };
  },

  methods: {
    edit() {
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/time_zone", {
          clearCacheEntry: true,
        })
        .then(response => {
          this.timeZones = response.data.time_zones;
          this.timeZone = response.data.time_zone;
          this.fetching = false;
          this.drawer = true;
        });
    },

    save() {
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/time_zone", {
          time_zone: this.timeZone,
        })
        .then(() => {
          this.fetching = false;
          this.drawer = false;
          this.$emit("save");
        });
    },
  },
};
</script>