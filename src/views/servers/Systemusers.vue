<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem" class="mr-3" icon="mdi:mdi-plus"></v-btn>
        <TogglePasswordAuthentication :serverId="serverId" :passwordAuthentication="data.password_authentication" />
      </v-card-actions>

      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.users" :key="`item-${i}`" :title="item.name" :subtitle="item.label"
          @click="editItem(item)">
          <template v-slot:append>

            <v-icon v-if="item.default_ssh_user" size="x-small" title="Default SSH user" color="primary"
              icon="fas fa-check" class="mx-1"></v-icon>

            <v-icon v-if="item.sudo" size="x-small" title="Sudo privileges" color="primary" icon="fas fa-crown"
              class="mx-1"></v-icon>
            <v-icon v-else size="x-small" title="Non-sudo user" color="primary" icon="fas fa-user"
              class="mx-1"></v-icon>

            <v-icon v-if="item.sudo_without_password" size="x-small" title="Sudo without password" color="primary" icon="fas
                fa-lock-open" class="mx-1"></v-icon>
            <v-icon v-else size="x-small" color="primary" title="Sudo with password" icon="fas fa-lock"
              class="mx-1"></v-icon>

            <v-btn :disabled="loading" :loading="loading === item.name" @click.stop="deleteItem(item.name)" size="small"
              icon="mdi:mdi-delete"></v-btn>
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

              <v-text-field v-model="system_user.name" label="User" :readonly="!system_user.new" required
                autofocus></v-text-field>

              <PasswordField v-model="system_user.password" label="Password" required autocomplete="new-password">
              </PasswordField>

              <v-switch :disabled="system_user.default_ssh_user" v-model="system_user.default_ssh_user"
                label="Default SSH user" color="primary" hide-details></v-switch>

              <v-switch v-model="system_user.sudo" label="Sudo" color="primary" hide-details></v-switch>

              <v-switch :disabled="!system_user.sudo" v-model="system_user.sudo_without_password"
                label="Sudo without password" color="primary" hide-details></v-switch>

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
                    <v-btn icon="mdi:mdi-delete" size="small" :disabled="fetching" :loading="loading === item.line"
                      @click.stop="deleteKey(item.line)"></v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-btn @click="addKey" icon="mdi:mdi-plus"></v-btn>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="keyDrawer">
      <v-card :title="'Upload key for ' + user.name">
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
import Confirm from "../../components/ConfirmDialog.vue";
import PasswordField from "../../components/PasswordField.vue";

export default {
  components: {
    Loading,
    Copy,
    TogglePasswordAuthentication,
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
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/systemusers?detailed=1")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.data = response.data.item;
          document.title = "System users" + " | " + this.data.name;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
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
      this.user = user;
      this.fetching = true;
      this.tab = 'settings';

      api
        .get("servers/" + this.serverId + "/systemusers/" + this.user.name)
        .then((response) => {
          console.log(response);
          this.keys = response.data.keys;
          this.fetching = false;
        })
        .catch((error) => {
          console.log(error);
          this.fetching = false;
        })
        .finally(() => {
          this.system_user = user;
          this.userDrawer = true;
        });
    },
    deleteItem: async function (user) {
      if (!await this.$refs.confirm.open("Delete " + user + "?")) {
        return;
      }

      this.loading = user;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/systemusers", { user: user })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
        });

      return false;
    },
    saveUser() {
      if (this.system_user.name) {
        this.details = "";
        this.fetching = true;
        this.error = "";

        api
          .post("servers/" + this.serverId + "/systemusers", this.system_user)
          .then((response) => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
              this.fetching = false;
            } else {
              this.userDrawer = false;
              this.fetchData();
            }
          })
          .catch((error) => {
            console.log(error);
            this.fetching = false;
          });
      }
    },
    deleteKey: async function (line) {
      if (!await this.$refs.confirm.open("Delete key?")) {
        return;
      }

      this.loading = line;
      this.error = "";

      api
        .post(
          "servers/" + this.serverId + "/systemusers/" + this.user.name,
          { line: line }
        )
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.fetching = false;
            this.error = response.data.error;
          } else {
            this.editItem(this.user);
            this.tab = 'keys';
          }
        })
        .catch((error) => {
          this.fetching = false;
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
        });
    },
    addKey() {
      this.keyDrawer = true;
    },
    saveKey() {
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/systemusers/" + this.user.name, {
          key: this.key,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.fetching = false;
            this.error = response.data.error;
          } else {
            this.keyDrawer = false;
            this.editItem(this.user);
            this.tab = 'keys';
          }
        })
        .catch((error) => {
          this.fetching = false;
          console.log(error);
        });
    },
  },
};
</script>
