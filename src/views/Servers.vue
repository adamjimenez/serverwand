<template>
  <v-layout row><v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error">
          {{ error }}
        </v-alert>

        <Loading :value="loading" />

        <v-card :loading="fetching">
          <v-card-title primary-title>
            <div class="headline">Servers</div>
          </v-card-title>

          <div v-if="items.length">
            <v-card flat>
              <v-card-text>
                <v-select v-model="provider" :items="provider_opts" label="Provider"></v-select>
              </v-card-text>
            </v-card>

            <v-data-table :headers="headers" :items="filtered" class="results">

              <template v-slot:item.name="{ item }">

                <v-list-item :to="'/servers/' + item.raw.id + '/summary'">

                  <template v-slot:prepend>
                    <ServerIcon :provider="item.raw.provider"></ServerIcon>
                  </template>

                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.hostname }}</v-list-item-subtitle>
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
      page: 1,
      pages: 1,
      provider: "*",
      provider_opts: [
        {
          title: "All",
          value: "*",
        },
        {
          title: "Linode",
          value: "linode",
        },
        {
          title: "Digital Ocean",
          value: "digitalocean",
        },
        {
          title: "Other",
          value: "",
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
      var items =  [{
          title: "Server ",
          key: "name",
        },];

      if (!this.mobile) {
        items.push(
        {
          title: "Region ",
          key: "region",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          title: "Image ",
          key: "image",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          title: "Type ",
          key: "type",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
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

<style>
.results a {
  color: inherit;
}
</style>