<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <v-container v-if="!fetching" fluid>
      <v-row>
        <v-col>
          <v-list-item :title="data.name" :subtitle="data.hostname">
            <template v-slot:prepend>
              <ServerIcon :provider="data.provider"></ServerIcon>
            </template>
          </v-list-item>
        </v-col>

        <v-col class="text-right">
          <Terminal :data="data" color="success">            
            <v-icon small>fas fa-terminal</v-icon>
          </Terminal>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs show-arrows>
      <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
      <v-tab :to="'/servers/' + serverId + '/Files'">Files</v-tab>
      <v-tab :to="'/servers/' + serverId + '/services'">Services</v-tab>
      <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
      <v-tab :to="'/servers/' + serverId + '/database'">Database</v-tab>
      <v-tab :to="'/servers/' + serverId + '/systemusers'">System users</v-tab>
      <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
      <v-tab :to="'/servers/' + serverId + '/mail'">Mail</v-tab>
      <v-tab :to="'/servers/' + serverId + '/apps'">Apps</v-tab>
      <v-tab :to="'/servers/' + serverId + '/logs'">Logs</v-tab>
      <v-tab :to="'/servers/' + serverId + '/backups'">Cloud backups</v-tab>
      <v-tab :to="'/servers/' + serverId + '/settings'">Settings</v-tab>
    </v-tabs>
    <router-view></router-view>
  </div>
</template>

<script>
import api from "../services/api";
import ServerIcon from "../components/ServerIcon";
import Terminal from "../components/Terminal";

export default {
  components: {
    ServerIcon,
    Terminal
  },
  data() {
    return {
      error: "",
      data: {
        users: {},
      },
      users: [],
      details: "",
      fetching: false,
    };
  },
  created() {
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
      // this.fetching = true
      this.serverId = this.$route.params.id;

      api
        .get("servers/" + this.serverId)
        .then(response => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }

          if (response.data.item) {
            self.data = response.data.item;
            window.server = self.data;
          }
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
  },
};
</script>
