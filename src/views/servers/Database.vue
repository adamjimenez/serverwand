<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-container class="ma-0">
        <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                      <i class="fas fa-network-wired"></i>
                    </div>

                    <div class="label">Max Connection Usage</div>
                  </div>

                  <div class="pt-3" style="clear: both">
                    <v-list-item-title>
                      <v-progress-linear
                        :value="(data.max_used_connections/data.max_connections) * 100"
                        height="20"
                      ></v-progress-linear>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ (data.max_used_connections)}} used of
                      {{ (data.max_connections)}}
                    </v-list-item-subtitle>
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

      <v-container fluid>
        <v-row>
          <v-card>
            <v-card-text>
              <form
                :action="'http://' + data.ip + '/phpmyadmin/'"
                method="post"
                target="_blank"
              >
                <input
                  type="hidden"
                  name="pma_username"
                  :value="data.db_name"
                />
                <button type="submit">
                  PhpMyAdmin
                  <v-icon right>open_in_new</v-icon>
                </button>
              </form>
            </v-card-text>
          </v-card>
        </v-row>

        <v-row>

          <IPRestrictions
            :active="data.ip_restrictions.active"
            :items="data.ip_restrictions.ips"
            :path="'servers/' + this.serverId + '/database/iprestrictions'"
            @save="fetchData(true)"
          />

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
