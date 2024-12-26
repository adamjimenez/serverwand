<template>
  <div class="text-align-center d-flex flex-row justify-start flex-grow-1">
    <v-autocomplete v-model="model" :items="items" label="Search" placeholder="Search"
      @update:modelValue="afterselection" ref="autocomplete" hide-details hide-no-data single-line rounded no-filter
      class="mx-5" style="max-width: 800px;" variant="solo-filled" @focus="onSearchFocus" menu-icon="">
      <template v-slot:prepend-inner>
        <v-icon icon="mdi:mdi-arrow-left" v-if="searchFocussed" @click.stop="searchFocussed = false"
          @mousedown.stop></v-icon>
        <v-app-bar-nav-icon v-else-if="mobile" color="grey-lighten-1" @click.stop="menuToggle"
          @mousedown.stop></v-app-bar-nav-icon>
        <v-icon v-else icon="mdi:mdi-magnify"></v-icon>
      </template>
      <template v-slot:append-inner>
        <UserMenu v-if="mobile && !searchFocussed"></UserMenu>
      </template>
      <template v-slot:item="{ item, props }">
        <v-list-item v-bind="props"></v-list-item>
      </template>
    </v-autocomplete>
  </div>

</template>

<script>
import api from "../services/api";
import UserMenu from "./UserMenu";
import { useDisplay } from 'vuetify';

export default {
  components: {
    UserMenu,
  },
  data: () => ({
    model: null,
    items: [],
    servers: [],
    mobile: false,
    searchFocussed: false,
  }),

  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();

    //this.$eventHub.on("itemsChanged", this.fetchData);
  },

  methods: {
    menuToggle() {
      this.$emit("menuToggle");
    },
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
      this.searchFocussed = false;
      this.$nextTick(() => {
        this.$router.push(this.model);
        this.model = null;
        this.$refs.autocomplete.blur();
      });
    },
    onSearchFocus: function () {
      if (this.mobile) {
        this.searchFocussed = true;
      }
    }
  },
  mounted() {
    const { mobile } = useDisplay();
    this.mobile = mobile;
  },
};
</script>
