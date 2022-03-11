<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="fetching" />

    <v-card class="pa-3">
      <v-row>
        <v-col>
          <div class="ma-3">
            <v-btn @click="editServer"> Edit </v-btn>
          </div>

          <div class="ma-3">
            <Reboot :serverId="serverId" />
          </div>

          <div class="ma-3">
            <Disconnect :serverId="serverId" :server="data" />
          </div>

        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Reboot from "../../components/Reboot";
import Disconnect from "../../components/Disconnect";

export default {
  components: {
    Loading,
    Reboot,
    Disconnect,
  },
  data() {
    return {
      error: "",
      fetching: false,
      serverId: 0,
      data: {},
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData(clearCacheEntry) {
      var self = this;
      this.error = "";

      //this.fetching = true

      api
        .get("servers/" + this.serverId + "?detailed=1", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }

          if (response.data.item) {
            self.data = response.data.item;
            document.title = "Settings" + " | " + self.data.name;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    editServer() {
      this.$router.push("/servers/" + this.$route.params.id + "/edit");
    },
  },
};
</script>
