<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <v-list-item :title="data.name">
      <template v-slot:subtitle>
        <span class="text-no-wrap">
          {{ data.hostname }}
        </span>
      </template>
      <template v-slot:prepend>
        <ServerIcon :provider="data.provider"></ServerIcon>
      </template>
      <template v-slot:append>
        <Terminal :data="data" color="success" icon size="small">
          <v-icon icon="fas fa-terminal"></v-icon>
        </Terminal>
      </template>
    </v-list-item>

    <Tabs>
      <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
      <v-tab :to="'/servers/' + serverId + '/Files'">Files</v-tab>
      <v-tab :to="'/servers/' + serverId + '/mail'">Mail</v-tab>
      <v-tab :to="'/servers/' + serverId + '/backups'">Cloud backups</v-tab>
      <v-tab :to="'/servers/' + serverId + '/database'">Database</v-tab>
      <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
      <v-tab :to="'/servers/' + serverId + '/apps'">Apps</v-tab>
      <v-tab :to="'/servers/' + serverId + '/systemusers'">System users</v-tab>
      <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
      <v-tab :to="'/servers/' + serverId + '/services'">Services</v-tab>
      <v-tab :to="'/servers/' + serverId + '/banned'">Banned</v-tab>
      <v-tab :to="'/servers/' + serverId + '/settings'">Settings</v-tab>
    </Tabs>
    <router-view></router-view>
  </div>
</template>

<script>
import api from "../services/api";
import ServerIcon from "../components/ServerIcon";
import Terminal from "../components/Terminal";
import Tabs from "../components/Tabs";

export default {
  components: {
    ServerIcon,
    Terminal,
    Tabs,
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
      this.error = "";
      // this.fetching = true
      this.serverId = this.$route.params.id;

      if (!this.serverId) {
        return;
      }

      api
        .get("servers/" + this.serverId)
        .then(response => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          }

          if (response.data.item) {
            this.data = response.data.item;
            window.server = this.data;
          }
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>
