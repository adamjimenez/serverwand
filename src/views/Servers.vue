<template>
  <v-layout row><v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <Loading :value="loading" />

        <v-card :loading="fetching" title="Servers">
          <div v-if="items.length">
            <v-card flat>
              <v-card-text>
                <v-select v-model="provider" :items="provider_opts" label="Provider" hide-details>
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-icon="item?.raw?.icon" :title="item?.raw?.title"></v-list-item>
                  </template>
                </v-select>
              </v-card-text>
            </v-card>

            <v-data-table :headers="headers" :items="filtered">
              <template v-slot:item.name="{ item }">
                <v-list-item :to="'/servers/' + item.raw.id + '/summary'" :title="item.raw.name"
                  :subtitle="item.raw.hostname" class="px-0">
                  <template v-slot:prepend v-if="!mobile">
                    <ServerIcon :provider="item.raw.provider"></ServerIcon>
                  </template>
                </v-list-item>
              </template>
            </v-data-table>
          </div>

          <v-list v-else>
            <v-list-item>
              <v-list-item-title>
                <router-link to="/servers/create"> Add a server </router-link>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";
import ServerIcon from "../components/ServerIcon";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading,
    ServerIcon
  },
  data() {
    return {
      loading: false,
      fetching: false,
      error: null,
      filtered: [],
      items: [],
      provider: "*",
      provider_opts: [
        {
          title: "All",
          value: "*",
          icon: "fas fa-asterisk",
        },
        {
          title: "Linode",
          value: "linode",
          icon: "fab fa-linode",
        },
        {
          title: "Digital Ocean",
          value: "digitalocean",
          icon: "fab fa-digital-ocean",
        },
        {
          title: "Vultr",
          value: "",
          icon: "fas fa-server",
        },
        {
          title: "Other",
          value: "",
          icon: "fab fa-ubuntu",
        },
      ],
    };
  },
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    },
    headers: function () {
      var items = [{
        title: "Server ",
        key: "name",
      },];

      if (!this.mobile) {
        items.push(
          {
            title: "Region ",
            key: "region",
          },
          {
            title: "Image ",
            key: "image",
          },
          {
            title: "Type ",
            key: "type",
          });
      };

      return items;
    }
  },
  created() {
    document.title = "Servers";
    this.fetchData();
  },
  watch: {
    provider: function () {
      this.filtered = [];

      this.items.forEach((element) => {
        if (this.provider === "*" || element.provider == this.provider) {
          this.filtered.push(element);
          localStorage.provider = element.provider;
        }
      });
    },
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/")
        .then(response => {
          console.log(response);
          self.items = response.data.items;

          response.data.items.forEach((element) => {
            self.filtered.push(element);
          });
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
  },
};
</script>