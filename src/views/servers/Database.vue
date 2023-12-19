<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-container class="ma-0">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card>
                <v-card-text>
                  <v-row>
                    <v-col style="max-width: 40px;">
                      <v-icon>fas fa-network-wired</v-icon>
                    </v-col>

                    <v-col>Max Connection Usage</v-col>
                  </v-row>

                  <div class="pt-3" style="clear: both">
                    <v-list-item-title>
                      <v-progress-linear :model-value="(data.max_used_connections / data.max_connections) * 100"
                        height="20" color="primary"></v-progress-linear>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ (data.max_used_connections) }} used of
                      {{ (data.max_connections) }}
                    </v-list-item-subtitle>
                  </div>
                </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container fluid>
        <v-row>
          <v-col>
            <form :action="'http://' + data.ip + '/phpmyadmin/'" method="post" target="_blank">
              <input type="hidden" name="pma_username" :value="data.db_name" />
              <v-btn type="submit">
                PhpMyAdmin &nbsp;
                <v-icon right>mdi:mdi-open-in-new</v-icon>
              </v-btn>
            </form>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <IPRestrictions :active="data.ip_restrictions.active" :items="data.ip_restrictions.ips"
              :path="'servers/' + serverId + '/database/iprestrictions'" @save="fetchData(true)" :remoteAddr="data.remote_addr" />
          </v-col>
        </v-row>
      </v-container>

    </v-card>

  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import IPRestrictions from "../../components/IPRestrictions";

export default {
  components: {
    Loading,
    IPRestrictions,
  },
  data() {
    return {
      loading: false,
      error: "",
      data: {
        ip_restrictions: {

        }
      },
      details: "",
      fetching: false,
      drawer: false,
      serverId: 0,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/database")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data.item;
          document.title = "Database" + " | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>
