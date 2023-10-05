<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-container v-if="!fetching" fluid>
      <v-row>
        <v-col>
          <v-list-item :title="data.name" prepend-icon="fas fa-users"></v-list-item>
        </v-col>
      </v-row>
    </v-container>

    <Tabs>
      <v-tab :to="'/teams/' + id + '/members'">Members</v-tab>
      <v-tab :to="'/teams/' + id + '/servers'">Servers</v-tab>
      <v-tab :to="'/teams/' + id + '/settings'">Settings</v-tab>
    </Tabs>
    <router-view></router-view>

  </div>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";
import Tabs from "../components/Tabs";

export default {
  components: {
    Loading,
    Tabs,
  },
  data() {
    return {
      loading: "",
      id: null,
      error: null,
      data: {},
      fetching: false,
    };
  },
  created() {
    document.title = "Team";
    this.id = this.$route.params.id;
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

      api
        .get("teams/" + this.id)
        .then(response => {
          console.log(response);
          self.data = response.data.item;
          document.title = self.data.name;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => self.fetching = false);
    },
  },
};
</script>