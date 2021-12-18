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
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              @click="clearSSHUser"
            >
              Clear SSH user
            </v-btn>
          </div>

          <div class="ma-3">
            <v-btn :disabled="fetching" :loading="fetching" @click="reboot">
              Reboot
            </v-btn>
          </div>

          <div class="ma-3">
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              @click="deleteServer"
              color="error"
            >
              Disconnect
            </v-btn>
          </div>

          <div>
            <v-card-title primary-title>
              <v-switch
                v-model="data.password_authentication"
                label="SSH Password Authentication"
                @change="togglePasswordAuthentication()"
              ></v-switch>
            </v-card-title>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";

export default {
  components: {
    Loading,
  },
  data() {
    return {
      error: "",
      data: {},
      details: "",
      fetching: false,
      serverId: 0,
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
    deleteServer() {
      this.$confirm("Disconnect from server " + this.data.name + "?").then(
        (res) => {
          if (res) {
            var self = this;
            this.fetching = true;

            api
              .get("servers/" + this.$route.params.id + "/delete")
              .then(function (response) {
                console.log(response);

                if (response.data.success) {
                  // subscribe to status changes
                  self.$router.push("/servers/");
                }
              })
              .catch(function (error) {
                console.log(error);
              })
              .finally(function () {
                self.fetching = false;
              });
          }
        }
      );
    },
    clearSSHUser() {
      this.$confirm("Clear SSH user?").then((res) => {
        if (res) {
          var self = this;
          self.fetching = true;
          api
            .post("servers/" + this.serverId + "/savesshuser", {
              ssh_username: "",
            })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.error = response.data.error;
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.fetching = false;
              self.chooseUser = false;
            });
        }
      });
    },
    togglePasswordAuthentication() {
      var self = this;
      this.error = "";
      this.fetching = true;
      this.loading = true;

      api
        .post("servers/" + this.serverId + "/password_authentication", {
          save: 1,
          enable: this.data.password_authentication,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
          self.loading = false;
        });
    },
    reboot() {
      this.$confirm("Reboot server?").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;

          api
            .get("servers/" + this.serverId + "/reboot")
            .then(function (response) {
              console.log(response);

              if (response.data.success) {
                this.$router.push("/servers");
              }
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.fetching = false;
            });
        }
      });
    },
  },
};
</script>
