<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <form :action="'http://' + data.ip + '/phpmyadmin/'" method="post" target="_blank">
          <input type="hidden" name="pma_username" :value="data.db_name" />
          <v-btn type="submit">
            PhpMyAdmin &nbsp;
            <v-icon right>mdi:mdi-open-in-new</v-icon>
          </v-btn>
        </form>
      </v-card-actions>

      <IPRestrictions :active="data.ip_restrictions.active" :items="data.ip_restrictions.ips"
        :path="'servers/' + serverId + '/database/iprestrictions'" @save="fetchData(true)"
        :remoteAddr="data.remote_addr" />

      <v-card max-width="300">
        <v-card-text>
          <v-row>
            <v-col style="max-width: 40px;">
              <v-icon>fas fa-network-wired</v-icon>
            </v-col>
            <v-col>Max Connection Usage</v-col>
          </v-row>

          <div class="pt-3" style="clear: both">
            <v-list-item-title>
              <v-progress-linear :model-value="(data.max_used_connections / data.max_connections) * 100" height="20"
                color="primary"></v-progress-linear>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ (data.max_used_connections) }} used of
              {{ (data.max_connections) }}
            </v-list-item-subtitle>
          </div>
        </v-card-text>
      </v-card>
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
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/database")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.data = response.data.item;
          document.title = "Database" + " | " + this.data.name;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
  },
};
</script>
