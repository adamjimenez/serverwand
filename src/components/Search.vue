<template>
  <div style="flex: 1; padding: 0 10px; margin-bottom: -20px">
    <v-autocomplete
      v-model="model"
      :items="items"
      label="Search"
      persistent-hint
      @input="afterselection"
      ref="autocomplete"
    >
      <template slot="item" slot-scope="data">
        <template v-if="(typeof data.item) !== 'object'" >
          <v-list-item-content v-text="data.item"></v-list-item-content>
        </template>
        <template v-else>
          <v-list-item-avatar>
            <v-icon>{{ data.item.avatar }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="results">
            <v-list-item-title>{{ data.item.text }}</v-list-item-title>
            <v-list-item-subtitle
              v-html="data.item.subtitle"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  data: () => ({
    model: null,
    items: [],
    servers: [],
  }),

  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();

    this.$eventHub.on("itemsChanged", this.fetchData);
  },

  methods: {
    fetchData() {
      var self = this;
      this.error = this.post = null;
      this.loading = true;

      api
        .get("sites/")
        .then(function (response) {
          console.log(response);
          response.data.items.forEach((element) => {
            let avatar = 'fas fa-sitemap';

            // determine icon
            switch (element.app) {
              case 'wordpress':
                avatar = 'fab fa-wordpress';
              break;
              case 'git':
                avatar = 'fab fa-git';
              break;
              case 'node':
                avatar = 'fab fa-node-js';
              break;
              case 'joomla':
                avatar = 'fab fa-joomla';
              break;
              case 'drupal':
                avatar = 'fab fa-drupal';
              break;
              case 'magento':
                avatar = 'fab fa-magento';
              break;
              case 'roundcube':
                avatar = 'fas fa-envelope';
              break;
              case 'shiftlib':
                avatar = 'fas fa-user-edit';
              break;
            }

            self.items.push({
              text: element.domain,
              subtitle: self.servers[element.server],
              value: "/sites/" + element.id + "/summary",
              avatar: avatar,
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });

      api
        .get("servers/")
        .then(function (response) {
          console.log(response);
          response.data.items.forEach((element) => {
            self.$set(self.servers, element.id, element.name);

            // determine icon
            let avatar = 'fas fa-server';
            switch (element.provider) {
              case 'linode':
                avatar = 'fab fa-linode';
              break;
              case 'digitalocean':
                avatar = 'fab fa-digital-ocean';
              break;
            }

            self.items.push({
              text: element.name,
              subtitle: element.hostname,
              value: "/servers/" + element.id + "/summary",
              avatar: avatar,
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },
    afterselection() {
      this.$nextTick(() => {
        this.$router.push(this.model);
        this.model = null;
        this.$refs.autocomplete.blur();
      });
    },
  },
};
</script>

<style>
.results a {
  color: inherit !important;
}
</style>