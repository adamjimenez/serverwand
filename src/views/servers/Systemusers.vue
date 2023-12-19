<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem" class="mr-3" icon="mdi:mdi-plus"></v-btn>
        <TogglePasswordAuthentication :serverId="serverId" :passwordAuthentication="data.password_authentication" />
        <ClearSSHUser :serverId="serverId" :server="data" />
      </v-card-actions>

      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.users" :key="`item-${i}`" :title="item.name" :subtitle="item.label"
          @click="editItem(item)">
          <template v-slot:append>
            <span class="d-block" style="width: 32px;">
              <v-icon v-if="item.sudo" size="x-small" title="Sudo privileges" color="primary"
                icon="fas fa-crown"></v-icon>
              <v-icon v-else size="x-small" title="Non-sudo user" color="primary" icon="fas fa-user"></v-icon>
            </span>

            <span class="d-block" style="width: 32px;">
              <v-icon v-if="item.sudo_without_password" size="x-small" title="Sudo without password" color="primary" icon="fas
                fa-lock-open"></v-icon>
              <v-icon v-else size="x-small" color="primary" title="Sudo with password" icon="fas fa-lock"></v-icon>
            </span>

            <v-btn icon :disabled="loading" :loading="loading" @click.stop="deleteItem(item.name)">
              <v-icon size="small" icon="mdi:mdi-delete"></v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="userDrawer" max-width="600">
      <v-card title="System user">
        <v-tabs v-model="tab">
          <v-tab value="settings">Settings</v-tab>
          <v-tab value="keys" :disabled="system_user.new">Keys</v-tab>
        </v-tabs>

        <v-card-text>

          <v-window v-model="tab">
            <v-window-item value="settings">

              <v-text-field v-model="system_user.name" label="User" :readonly="!system_user.new" required></v-text-field>

              <PasswordField v-model="system_user.password" label="Password" required autocomplete="new-password">
              </PasswordField>

              <v-switch v-model="system_user.sudo" label="sudo" color="primary" hide-details></v-switch>

              <v-switch :disabled="!system_user.sudo" v-model="system_user.sudo_without_password"
                label="sudo without password" color="primary" hide-details></v-switch>

              <v-btn :disabled="!system_user.name" :loading="loading" color="success" @click="saveUser" class="mt-5">
                Save
              </v-btn>
            </v-window-item>

            <v-window-item value="keys">
              <div>Public SSH key</div>

              <v-list>
                <v-list-item>
                  <v-list-item-subtitle style="white-space: nowrap;">
                    {{ user.key }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn icon :disabled="fetching" :loading="fetching" v-if="user.key">
                      <Copy :val="user.key" />
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <div>Authorized keys</div>

              <v-list v-if="!fetching">
                <v-list-item v-for="(item, i) in keys" :key="`item-${i}`" :title="item.name">
                  <v-list-item-subtitle style="white-space: nowrap;">
                    {{ item.key }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn icon :disabled="fetching" :loading="fetching">
                      <Copy :val="item.key" />
                    </v-btn>
                    <v-btn icon :disabled="fetching" :loading="loading === item.line" @click.stop="deleteKey(item.line)">
                      <v-icon size="small">mdi:mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-btn @click="addKey" color="success" class="mt-3"> Upload Key </v-btn>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="keyDrawer">
      <v-card>
        <v-card-title> Upload key for {{ user.name }} </v-card-title>

        <v-card-text>
          <v-text-field v-model="key" label="Public key"></v-text-field>

          <v-btn :disabled="!key" :loading="fetching" color="success" @click="saveKey">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";
import TogglePasswordAuthentication from "../../components/TogglePasswordAuthentication";
import ClearSSHUser from "../../components/ClearSSHUser";
import Confirm from "../../components/ConfirmDialog.vue";
import PasswordField from "../../components/PasswordField.vue";

export default {
  components: {
    Loading,
    Copy,
    TogglePasswordAuthentication,
    ClearSSHUser,
    Confirm,
    PasswordField,
  },
  data() {
    return {
      tab: null,
      error: "",
      data: {
        users: {},
      },
      system_user: {
        user: "",
        password: "",
        key: "",
        sudo: false,
        sudo_without_password: false,
      },
      details: "",
      loading: null,
      fetching: false,
      userDrawer: false,
      keyDrawer: false,
      serverId: 0,
      user: "",
      keys: [],
      key: "",
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/systemusers?detailed=1")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data.item;
          document.title = "System users" + " | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.system_user = {
        name: '',
        password: '',
        key: '',
        sudo: false,
        new: true,
      };

      this.tab = 'settings';
      this.userDrawer = true;
    },
    editItem(user) {
      var self = this;
      this.user = user;
      this.fetching = true;
      this.tab = 'settings';

      api
        .get("servers/" + this.serverId + "/systemusers/" + this.user.name)
        .then(function (response) {
          console.log(response);
          self.keys = response.data.keys;
          self.fetching = false;
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        })
        .finally(function () {
          self.system_user = user;
          self.userDrawer = true;
        });
    },
    deleteItem: async function (user) {
      if (!await this.$refs.confirm.open("Delete " + user + "?")) {
        return;
      }

      var self = this;
      this.loading = user;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/systemusers", { user: user })
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
          self.loading = null;
        });

      return false;
    },
    saveUser() {
      var self = this;

      if (this.system_user.name) {
        this.details = "";
        this.fetching = true;
        this.error = "";

        api
          .post("servers/" + this.serverId + "/systemusers", this.system_user)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
              self.fetching = false;
            } else {
              self.userDrawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          });
      }
    },
    deleteKey: async function (line) {
      if (!await this.$refs.confirm.open("Delete key?")) {
        return;
      }

      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post(
          "servers/" + this.serverId + "/systemusers/" + this.user.name,
          { line: line }
        )
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.fetching = false;
            self.error = response.data.error;
          } else {
            self.editItem(self.user);
            self.tab = 'keys';
          }
        })
        .catch(function (error) {
          self.fetching = false;
          console.log(error);
        });
    },
    addKey() {
      this.keyDrawer = true;
    },
    saveKey() {
      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/systemusers/" + this.user.name, {
          key: self.key,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.fetching = false;
            self.error = response.data.error;
          } else {
            self.keyDrawer = false;
            self.editItem(self.user);
            self.tab = 'keys';
          }
        })
        .catch(function (error) {
          self.fetching = false;
          console.log(error);
        });
    },
  },
};
</script>
