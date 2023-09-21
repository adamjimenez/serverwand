<template>
  <v-layout row>
    <v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <Loading :value="loading" />

        <v-card flat :loading="fetching">
          <v-card flat>
            <v-card-text>
              <v-select v-model="server" :items="server_opts" label="Server" hide-details clearable></v-select>
            </v-card-text>
          </v-card>

          <v-data-table :headers="headers" :items="filtered">
            <template v-slot:item.domain="{ item }">
              <v-list-item :to="'/sites/' + item.raw.id + '/summary'" :title="item.raw.domain" :subtitle="servers[item.raw.server]" class="px-0">
                <template v-slot:prepend v-if="!mobile">
                  <SiteIcon :app="item.raw.app"></SiteIcon>
                </template>
              </v-list-item>
            </template>
            <template v-slot:item.usage="{ item }">
              <div v-if="item.raw.usage > 0">
                {{ prettyBytes(item.raw.usage * 1024) }}
              </div>
            </template>
            <template v-slot:item.transfer="{ item }">
              <div v-if="item.raw.transfer > 0">
                {{ prettyBytes(item.raw.transfer * 1024) }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script>
import api from "../services/api";
import util from "../services/util";
import Loading from "../components/Loading";
import SiteIcon from "../components/SiteIcon";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading,
    SiteIcon,
  },
  data() {
    return {
      fetching: false,
      loading: false,
      error: "",
      filtered: [],
      items: [],
      servers: {},
      server: "*",
      server_opts: [],
      searchPanel: [false],
      search: "",
      selected: [],
    };
  },
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    },
    headers: function () {
      var items =  [
        {
          title: "Site",
          key: "domain",
        }];

      if (!this.mobile) {
        items.push(
          {
          title: "IP",
          key: "ip",
        },
        {
          title: "MX",
          key: "mx",
        },
        {
          title: "Size",
          key: "usage",
        },
        {
          title: "Transfer",
          key: "transfer",
        });
      };

      return items;
    }
  },
  created() {
    document.title = "Sites";
    this.fetchData();
  },
  watch: {
    server: function () {
      this.filtered = [];

      this.items.forEach((element) => {
        if (!this.server || element.server == this.server) {
          this.filtered.push(element);
        }
      });

      localStorage.server = this.server;
    },
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("sites/")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.items = response.data.items;

          response.data.items.forEach((element) => {
            self.filtered.push(element);
          });

          api.get("servers/").then(function (response) {
            response.data.items.forEach((element) => {
              self.server_opts.push({
                title: element.name,
                value: element.id,
              });
              self.servers[element.id] = element.name
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;

          if (localStorage.server) self.server = localStorage.server;
        });
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>