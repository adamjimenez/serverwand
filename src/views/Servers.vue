<template>
  <v-layout row><v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <Loading :value="loading" />

        <v-card :loading="fetching">
          <div v-if="items.length">
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-select v-model="provider" :items="provider_opts" label="Provider" hide-details clearable>
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :prepend-icon="item?.raw?.icon" :title="item?.raw?.title"></v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <v-col>
                  <v-select v-model="team" :items="teams" item-title="name" item-value="id" label="Team" hide-details
                    clearable></v-select>
                </v-col>
              </v-row>
            </v-container>

            <v-data-table :headers="headers" :items="filtered">
              <template v-slot:item.name="{ item }">
                <v-list-item :to="'/servers/' + item.id + '/summary'" :title="item.name" :subtitle="item.hostname"
                  class="px-0">
                  <template v-slot:prepend v-if="!mobile">
                    <ServerIcon :provider="item.provider"></ServerIcon>
                  </template>
                </v-list-item>
              </template>

              <template v-slot:item.connected="{ item }">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="error" v-if="item.connected == 0">
                      fa-solid fa-circle
                    </v-icon>
                    <v-icon color="warning" v-else-if="item.health?.length">fas fa-exclamation-triangle
                      fa-beat</v-icon>
                    <v-icon color="success" v-else>
                      fa-solid fa-circle
                    </v-icon>
                  </template>

                  <span v-if="!mobile">
                    <span v-if="item.connected == 0">
                      Unavailable
                    </span>
                    <span v-else-if="item.health?.length">
                      {{ item.health?.length }} issue{{ item.health?.length !== 1 ? 's' : '' }}
                    </span>
                    <span v-else>
                      Connected
                    </span>
                  </span>
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
      items: [],
      team: null,
      teams: [],
      provider: null,
      provider_opts: [{
        title: "Linode",
        value: "linode",
        icon: "fab fa-linode",
      }, {
        title: "Digital Ocean",
        value: "digitalocean",
        icon: "fab fa-digital-ocean",
      }, {
        title: "Vultr",
        value: "vultr",
        icon: "fas fa-server",
      }],
    };
  },
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    },
    headers: function () {
      let items = [{
        title: "Server ",
        key: "name",
      }, {
        title: "Status ",
        key: "connected",
      }];

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
    },
    filtered: function () {
      let filtered = [];

      this.items.forEach((element) => {
        if (this.provider && element.provider == this.provider) {
          return;
        }

        if (this.team) {
          let found = false;

          this.teams.forEach(function (team) {
            if (team.id == this.team) {
              team.servers.forEach(function (server) {
                if (server.server == element.id) {
                  found = true;
                }
              });
            }
          })

          if (!found) {
            return;
          }
        }

        filtered.push(element);
      });

      return filtered;
    }
  },
  created() {
    document.title = "Servers";
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("servers/")
        .then(response => {
          console.log(response);
          this.items = response.data.items;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);

      api
        .get("teams/")
        .then(response => {
          console.log(response);
          this.teams = response.data.items;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>