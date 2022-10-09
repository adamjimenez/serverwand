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
            <v-icon left>fas fa-globe</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ data.domain }}

              <a v-bind:href="'http://' + data.domain" target="_blank">
                <v-icon right>open_in_new</v-icon>
              </a>
            </v-list-item-title>
            <v-list-item-subtitle> </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-tabs>
        <v-tab :to="'/domains/' + domainId + '/summary'">Summary</v-tab>
        <v-tab :to="'/domains/' + domainId + '/dns'">DNS</v-tab>
        <v-tab :to="'/domains/' + domainId + '/settings'">Settings</v-tab>
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
      domainId: null,
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
    document.title = "Domain";
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
      this.domainId = this.$route.params.id;

      api
        .get("domains/" + this.domainId)
        .then(response => {
            console.log(response);

            if(response.data.item)
              self.data=response.data.item;

            if(response.data.domain)
              document.title=self.data.domain;
          })
        .catch(error => console.log(error))
        .finally(() => self.fetching=false);
    },
  },
};
</script>

<style>
.v-list-item__subtitle a {
  color: inherit !important;
}
</style>