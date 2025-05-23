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

          <v-data-table
            :headers="headers"
            :items="filtered"
            :items-per-page="100"
            hover
            @click:row="function (event, data) { $router.push('/sites/' + data.item.id + '/summary') }"
            fixed-header
            :hide-default-header="!display.smAndUp"
            class="overflow-auto"
            style="height: calc(100vh - 200px);"
          >
            <template v-slot:item.domain="{ item }">
              <v-list-item :title="item.domain" class="px-0">
                <template v-slot:subtitle>
                  <span class="text-no-wrap">
                    {{ servers[item.server] }}
                  </span>
                </template>
                <template v-slot:prepend v-if="display.smAndUp">
                  <SiteIcon :app="item.app"></SiteIcon>
                </template>
              </v-list-item>
            </template>
            <template v-slot:item.usage="{ item }">
              <div v-if="item.usage > 0">
                {{ prettyBytes(item.usage * 1024) }}
              </div>
            </template>
            <template v-slot:item.transfer="{ item }">
              <div v-if="item.transfer > 0">
                {{ prettyBytes(item.transfer * 1024) }}
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
      server: null,
      server_opts: [],
      searchPanel: [false],
      search: "",
      selected: [],
			display: {},
    };
  },
  computed: {
    headers: function () {
      var items = [{
        title: "Site",
        key: "domain",
      }];

      if (this.display.smAndUp) {
        items.push({
          title: "IP",
          key: "ip",
          maxWidth: 140,
        });
      }

      if (this.display.mdAndUp) {
        items.push({
          title: "MX",
          key: "mx",
        });
      }

      if (this.display.lgAndUp) {
        items.push({
          title: "Size",
          key: "usage",
        }, {
          title: "Transfer",
          key: "transfer",
        });
      }

      return items;
    }
  },
  created() {;
		this.display = this.$vuetify.display;

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

      if (this.server) {
        localStorage.server = this.server;
      } else {
        delete localStorage.server;
      }
    },
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("sites/")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.items = response.data.items;

          response.data.items.forEach((element) => {
            this.filtered.push(element);
          });

          api.get("servers/").then((response) => {
            response.data.items.forEach((element) => {
              this.server_opts.push({
                title: element.name,
                value: element.id,
              });
              this.servers[element.id] = element.name
            });
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;

          if (localStorage.server) this.server = localStorage.server;
        });
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>