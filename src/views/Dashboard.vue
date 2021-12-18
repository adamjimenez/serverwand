<template>
  <v-layout row>
    <v-flex>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>

      <Loading :value="loading" />

      <v-card class="mx-auto" :loading="fetching">
        <v-card-title primary-title>
          <div class="headline">Dashboard</div>
        </v-card-title>

        <v-layout row class="mx-1">
          <v-flex xs6 v-if="!restricted">
            <v-card>
              <v-card-subtitle class="pb-0"> Servers </v-card-subtitle>

              <v-list two-line v-if="servers.length" class="results">
                <template v-for="item in servers">
                  <v-list-item :key="item.name">
                    <v-list-item-avatar>
                      <v-icon>fas fa-server</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <router-link :to="'/servers/' + item.id + '/summary'">
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.hostname
                        }}</v-list-item-subtitle>
                      </router-link>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>

              <v-list v-else>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <router-link to="/servers/create">
                        Add a server
                      </router-link>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-flex>

          <v-flex xs6>
            <v-card>
              <v-card-subtitle class="pb-0"> Sites </v-card-subtitle>

              <v-list two-line v-if="sites.length" class="results">
                <template v-for="(item, index) in sites">
                  <v-divider
                    v-if="item.divider"
                    :inset="item.inset"
                    :key="index"
                  ></v-divider>

                  <v-list-item v-else :key="item.name">
                    <v-list-item-avatar>
                      <v-icon>fas fa-globe</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <router-link :to="'/sites/' + item.id + '/summary'">
                        <v-list-item-title
                          v-html="item.domain"
                        ></v-list-item-title>
                        <v-list-item-subtitle>{{
                          serverOptions[item.server]
                        }}</v-list-item-subtitle>
                      </router-link>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>

              <v-list v-else>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <router-link to="/sites/create"> Add a site </router-link>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";

export default {
  components: {
    Loading,
  },
  data() {
    return {
      fetching: false,
      loading: false,
      post: null,
      error: "",
      servers: [],
      sites: [],
      serverOptions: {},
    };
  },
  props: {
    restricted: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    document.title = "ServerWand";
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("summary")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;

            if (response.data.expired) {
              location.href = "https://serverwand.com/pricing";
            }

            return false;
          }

          self.sites = response.data.sites;

          api.get("servers/").then(function (response) {
            self.servers = response.data.items;

            response.data.items.forEach((element) => {
              self.$set(self.serverOptions, element.id, element.name);
            });
          });
        })
        .catch(function (error) {
          console.log(error);
          self.error = error;
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>

<style>
.results a {
  color: inherit;
}
</style>