<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <div v-if="data.info">
        <v-list lines="two">
          <v-list-item>
              <v-list-item-title> Created </v-list-item-title>
              <v-list-item-subtitle>
                {{ data.info?.created }}
              </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
              <v-list-item-title> Expires </v-list-item-title>
              <v-list-item-subtitle>
                {{ data.info?.expires }}
              </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
              <v-list-item-title> Auto renew </v-list-item-title>
              <v-list-item-subtitle>
                <Edit
                  :val="data.info?.auto_renew"
                  label="Auto renew"
                  name="auto_renew"
                  :path="'domains/' + this.domainId + '/update'"
                  yesno
                />
              </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="data.info?.locked">
              <v-list-item-title> Locked </v-list-item-title>
              <v-list-item-subtitle>
                {{ data.info?.locked }}
              </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="data.info?.status">
              <v-list-item-title> Status </v-list-item-title>
              <v-list-item-subtitle>
                {{ data.info?.status }}
              </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
              <v-list-item-title> Nameservers </v-list-item-title>
              <v-list-item-subtitle>
                <div
                  v-for="(item, key) in data.info?.nameservers"
                  v-bind:key="key"
                >
                  {{ item }}
                </div>
              </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <div v-else>
        <p>Registrar not connected</p>
      </div>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Edit from "../../components/Edit";

export default {
  components: {
    Loading,
    Edit,
  },
  data() {
    return {
      domainId: null,
      post: null,
      error: null,
      data: {
        info: {
          nameservers: {
            nameserver: {},
          },
        },
      },
      details: "",
      loading: false,
      fetching: false,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData(clearCacheEntry) {
      var self = this;
      this.error = "";
      this.domainId = this.$route.params.id;
      this.fetching = true;

      api
        .get("domains/" + this.domainId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.item) {
            self.data = response.data.item;
          }

          if (self.data.domain) {
            document.title = "Summary | " + self.data.domain;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>