<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-list-item>
      <template v-slot:prepend>
        <v-btn to="/servers/" icon v-if="$vuetify.display.mobile" class="mr-5">
            <v-icon icon="mdi: mdi-arrow-left" />
        </v-btn>
        <v-icon v-if="$vuetify.display.smAndUp">fas fa-user</v-icon>
      </template>      
      <v-list-item-title>{{ data.name }}</v-list-item-title>
    </v-list-item>

    <Tabs>
      <v-tab :to="'/users/' + userId + '/summary'">Summary</v-tab>
      <v-tab :to="'/users/' + userId + '/sites'">Sites</v-tab>
      <v-tab :to="'/users/' + userId + '/domains'">Domains</v-tab>
      <v-tab :to="'/users/' + userId + '/invoices'">Invoices</v-tab>
      <v-tab :to="'/users/' + userId + '/subscriptions'">Subscriptions</v-tab>
      <v-tab :to="'/users/' + userId + '/notes'">Notes</v-tab>
      <v-tab :to="'/users/' + userId + '/settings'">Settings</v-tab>
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
      userId: null,
      error: null,
      data: {},
      fetching: false,
      hideAppBar: true
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
      this.error = "";
      // this.fetching = true
      this.userId = this.$route.params.id;

      api
        .get("users/" + this.userId)
        .then(response => {
          console.log(response);

          this.data = response.data.item;
          document.title = this.data.domain;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
  },
};
</script>
