<template>
  <v-layout row>
    <v-flex>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>

      <Loading :value="fetching" />

      <v-list two-line v-if="!fetching">
        <v-list-item>
          <v-list-item-avatar>
            <v-icon left>fas fa-user</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ data.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-tabs>
        <v-tab :to="'/users/' + userId + '/summary'">Summary</v-tab>
        <v-tab :to="'/users/' + userId + '/sites'">Sites</v-tab>
        <v-tab :to="'/users/' + userId + '/domains'">Domains</v-tab>
        <v-tab :to="'/users/' + userId + '/invoices'">Invoices</v-tab>
        <v-tab :to="'/users/' + userId + '/subscriptions'">Subscriptions</v-tab>
        <v-tab :to="'/users/' + userId + '/notes'">Notes</v-tab>
        <v-tab :to="'/users/' + userId + '/settings'">Settings</v-tab>
      </v-tabs>
      <router-view></router-view>
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
      userId: null,
      post: null,
      error: null,
      data: {
        server: {},
      },
      details: "",
      fetching: false,
      aliasDrawer: false,
    };
  },
  created() {
    document.title = "User";
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
      this.userId = this.$route.params.id;

      api
        .get("users/" + this.userId)
        .then(response => {
          console.log(response);

          self.data = response.data.item;
          document.title = self.data.domain;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          self.fetching = false;
        });
    },
  },
};
</script>
