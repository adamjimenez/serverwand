<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-container v-if="!fetching" fluid>
      <v-row>

        <v-col>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon left>fas fa-users</v-icon>
            </template>

            <v-list-item-title>
              {{ data.name }}
            </v-list-item-title>
          </v-list-item>
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
      details: "",
      fetching: false,
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      member: {
        email: "",
      },
      memberDrawer: false,
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