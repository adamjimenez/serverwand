<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon @click="edit()">
          <v-icon small>fas fa-wrench</v-icon>
        </v-btn>
      </template>
      <span>Configure Time Zone</span>
    </v-tooltip>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-card-title> Edit Time Zone </v-card-title>

        <v-card-text>

          <v-select
              v-model="timeZone"
              :items="timeZones"
              label="Time Zone"
          ></v-select>

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
    </v-navigation-drawer>
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
      var self = this;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/time_zone", {
            clearCacheEntry: true,
        })
        .then(response => {
            self.timeZones = response.data.time_zones;
            console.log(self.timeZones)
            console.log(response.data)
            self.timeZone = response.data.time_zone;
            self.fetching = false;
            self.drawer = true;
        });
    },

    save() {
      var self = this;
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/time_zone", {
            time_zone: self.timeZone,
        })
        .then(() => {
            self.fetching=false;
            self.drawer=false;
            self.$emit("save");
        });
    },
  },
};
</script>