<template>
  <div class="flex-1-1 mx-2">
    <v-autocomplete v-model="model" :items="items" label="Search" placeholder="Search" @update:modelValue="afterselection"
      ref="autocomplete" hide-details prepend-inner-icon="mdi:mdi-magnify" single-line rounded variant="solo-filled">

      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props" :prepend-icon="item?.raw?.avatar" :title="item?.raw?.title"
          :subtitle="item?.raw?.subtitle"></v-list-item>
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

    //this.$eventHub.on("itemsChanged", this.fetchData);
  },

  methods: {
    fetchData() {
      this.error = this.post = null;
      this.loading = true;

      api
        .get("servers/")
        .then((response) => {
          console.log(response);
          response.data.items.forEach((element) => {
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

            this.items.push({
              title: element.name,
              subtitle: element.hostname,
              value: "/servers/" + element.id + "/summary",
              avatar: avatar,
            });

            this.servers[element.id] = element.name;
          });
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.loading = false;
        });

      api
        .get("sites/")
        .then(response => {
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

            this.items.push({
              title: element.domain,
              subtitle: this.servers[element.server],
              value: "/sites/" + element.id + "/summary",
              avatar: avatar,
            });
          });
        })
        .catch(error => console.log(error))
        .finally(() => this.loading = false);
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
