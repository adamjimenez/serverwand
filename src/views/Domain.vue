<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-container v-if="!fetching" fluid>
      <v-row>
        <v-col>
          <v-list-item :title="data.domain">
            <template v-slot:prepend>
              <v-icon left>fas fa-globe</v-icon>
            </template>
          </v-list-item>
        </v-col>

        <v-col class="d-flex align-center justify-end">
          <v-btn v-bind:href="'http://' + data.domain" target="_blank" title="Open site in new window" icon="mdi:mdi-open-in-new" size="small">
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <Tabs>
      <v-tab :to="'/domains/' + domainId + '/summary'">Summary</v-tab>
      <v-tab :to="'/domains/' + domainId + '/dns'">DNS</v-tab>
      <v-tab :to="'/domains/' + domainId + '/settings'">Settings</v-tab>
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
      this.error = "";
      // this.fetching = true
      this.domainId = this.$route.params.id;

      api
        .get("domains/" + this.domainId)
        .then(response => {
          console.log(response);

          if (response.data.item)
          this.data = response.data.item;

          if (response.data.domain)
            document.title = this.data.domain;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>

<style>
.v-list-item__subtitle a {
  color: inherit !important;
}
</style>