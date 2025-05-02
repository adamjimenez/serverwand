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
        <v-icon v-if="$vuetify.display.smAndUp">fas fa-users</v-icon>
      </template>      
      <v-list-item-title>{{ data.name }}</v-list-item-title>
    </v-list-item>

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
      hideAppBar: true
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
      this.error = "";
      this.id = this.$route.params.id;

      api
        .get("teams/" + this.id)
        .then(response => {
          console.log(response);
          this.data = response.data.item;
          document.title = this.data.name;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => this.fetching = false);
    },
  },
};
</script>