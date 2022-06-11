<template>
  <div>
    <v-layout row>
      <v-flex>
        <v-alert v-if="error" type="error">
          <div v-html="error"></div>
        </v-alert>

        <v-list v-if="!fetching">
          <v-list-item>
            <v-list-item-content>
              <v-container class="mx-0" style="max-width: 100%">
                <v-row>
                  <v-col>
                    <v-list-item class="px-0">
                      <v-list-item-icon>
                        <ServerIcon :provider="data.provider"></ServerIcon>
                      </v-list-item-icon>

                      <v-list-item-content class="py-0">
                        <v-list-item-title>
                          {{ data.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ data.hostname }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>

                  <v-col align="right">
                    <v-btn color="success" @click="terminal">
                      <v-icon small>fas fa-terminal</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-tabs show-arrows>
          <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
          <v-tab :to="'/servers/' + serverId + '/Files'">Files</v-tab>
          <v-tab :to="'/servers/' + serverId + '/services'">Services</v-tab>
          <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
          <v-tab :to="'/servers/' + serverId + '/database'">Database</v-tab>
          <v-tab :to="'/servers/' + serverId + '/systemusers'"
            >System users</v-tab
          >
          <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
          <v-tab :to="'/servers/' + serverId + '/mail'">Mail</v-tab>
          <v-tab :to="'/servers/' + serverId + '/apps'">Apps</v-tab>
          <v-tab :to="'/servers/' + serverId + '/logs'">Logs</v-tab>
          <v-tab :to="'/servers/' + serverId + '/backups'">Cloud backups</v-tab>
          <v-tab :to="'/servers/' + serverId + '/settings'">Settings</v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-flex>
    </v-layout>

    <v-dialog v-model="chooseUser">
      <v-card :loading="fetching">
        <v-card-title> Open Secure Shell </v-card-title>

        <v-card-text>
          <div v-if="users.length">
            <v-select
              v-model="ssh_username"
              :items="users"
              label="User"
            ></v-select>

            <v-btn
              :disabled="ssh_username.length === 0"
              color="success"
              @click="saveKeyAndContinue"
              right
              class="ml-3"
            >
              Save Key and Continue
            </v-btn>
          </div>

          <div v-else-if="!fetching">
            No system users, add one and try again.
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../services/api";
import ServerIcon from "../components/ServerIcon";

export default {
  components: {
    ServerIcon
  },
  data() {
    return {
      error: "",
      data: {
        users: {},
      },
      ssh_username: "",
      users: [],
      details: "",
      fetching: false,
      chooseUser: false,
    };
  },
  created() {
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
      this.serverId = this.$route.params.id;

      api
        .get("servers/" + this.serverId)
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }

          if (response.data.item) {
            self.data = response.data.item;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    fetchUsers() {
      var self = this;
      this.error = "";
      this.fetching = true;
      self.chooseUser = true;

      api
        .get("servers/" + this.serverId + "/systemusers")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          response.data.item.users.forEach((element) => {
            self.users.push({
              text: element.name,
              value: element.name,
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    saveKey(key) {
      var self = this;

      // save key
      api
        .post(
          "servers/" + self.serverId + "/systemusers/" + self.ssh_username,
          { key: key }
        )
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.fetching = false;
            self.error = response.data.error;
          } else {
            self.saveSSHUser();
          }
        })
        .catch(function (error) {
          self.fetching = false;
          console.log(error);
        });
    },
    saveSSHUser() {
      var self = this;
      self.fetching = true;
      api
        .post("servers/" + this.serverId + "/savesshuser", {
          ssh_username: self.ssh_username,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.data.ssh_username = self.ssh_username;
            self.terminal();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
          self.chooseUser = false;
        });
    },
    saveKeyAndContinue() {
      var self = this;
      self.fetching = true;

      // get ssh key
      api
        .post("https://shiftedit.net/api/prefs")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            self.chooseUser = false;
          } else {
            console.log(response.data.public_key);
            self.saveKey(response.data.public_key);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    terminal() {
      if (this.data.ssh_username) {
        console.log("open ssh " + this.data.ssh_username);

        var url =
          "http://shiftedit.net/ssh/?host=" +
          this.data.hostname +
          "&user=" +
          this.data.ssh_username;
          
        if (window.ssh_path) {
          url += "&path=" + window.ssh_path;
        }

        window.open(url);
      } else {
        this.fetchUsers();
      }
    },
  },
};
</script>
