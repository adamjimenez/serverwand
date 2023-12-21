<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>
      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.members" :key="`item-${i}`" :title="item.email">
          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.email" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Member">
        <v-card-text>
          <v-text-field v-model="member.email" label="Email" required autofocus></v-text-field>

          <v-btn :disabled="!member.email" :loading="dialog" color="success" @click="saveItem">
            Save
          </v-btn>

          <p v-if="useMasterPassword" style="font-size: 12px; margin-top: 20px">
            Note: Server keys shared with other users will not be encrypted with
            your master password
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Confirm
  },
  data() {
    return {
      fetching: false,
      loading: null,
      id: null,
      error: null,
      data: {},
      dialog: false,
      details: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      member: {
        email: "",
      },
      drawer: false,
      useMasterPassword: false,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
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
      this.fetching = true;

      api
        .get("teams/" + this.id)
        .then(function (response) {
          console.log(response);
          self.data = response.data.item;
          document.title = "Members | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });

      api.get("settings/profile").then(function (response) {
        self.useMasterPassword = response.data.profile.prefs.useMasterPassword;
      });
    },
    addItem() {
      this.member.email = "";
      this.drawer = true;
    },
    saveItem() {
      var self = this;

      if (this.member.email) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("teams/" + this.id, { email: this.member.email })
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.dialog = false;
          })
          .finally(function () {
            self.dialog = false;
          });
      }
    },
    deleteItem: async function (user) {
      if (!await this.$refs.confirm.open("Delete " + user.email)) {
        return;
      }

      var self = this;
      this.error = "";
      this.dialog = true;
      this.loading = user.email;

      api
        .post("teams/" + this.id + '/members', { delete: 1, user: user.user })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.dialog = false;
          self.loading = null;
        });
    }
  },
};
</script>