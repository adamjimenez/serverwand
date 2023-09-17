<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-container v-if="!fetching" fluid>
      <v-row>

        <v-col>
          <v-list-item :title="data.name">
            <template v-slot:prepend>
              <v-icon left>fas fa-user</v-icon>
            </template>
          </v-list-item>
        </v-col>

      </v-row>
    </v-container>

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

  </div>
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
