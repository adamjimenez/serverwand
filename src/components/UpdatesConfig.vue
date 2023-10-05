<template>
  <span>
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon @click="edit()">
          <v-icon size="small">fas fa-wrench</v-icon>
        </v-btn>
      </template>
      <span>Configure Updates</span>
    </v-tooltip>

    <v-dialog v-model="drawer">
      <v-card title="Configure Updates">
        <v-card-text>
            <v-switch
                v-model="automatic_updates"
                label="Automatic updates"
                @change="toggle()"
                color="primary"
                hide-details
            ></v-switch>
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
      automatic_updates: "",
      drawer: false,
    };
  },

  methods: {
    edit() {
      var self = this;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/updates", {
          clearCacheEntry: true,
        })
        .then(response => {
            self.automatic_updates=response.data.automatic_updates;
            self.fetching=false;
            self.drawer=true;
          });
    },

    toggle() {
      var self = this;
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/updates", {
          automatic_updates: self.automatic_updates,
        })
        .then(() => {
            self.fetching=false;
            self.drawer=false;
          });
    },
  },
};
</script>