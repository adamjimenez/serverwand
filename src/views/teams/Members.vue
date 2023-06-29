<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>
    
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in data.members">
            <v-list-item :key="`item-${i}`" :value="item">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.email }}
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
                    @click="deleteItem(item.user)"
                  >
                    <v-icon small>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add member </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-card-title> Member </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="member.email"
            label="Email"
            required
          ></v-text-field>

          <v-btn
            :disabled="dialog"
            :loading="dialog"
            color="success"
            @click="saveItem"
          >
            Save
          </v-btn>

          <p v-if="useMasterPassword" style="font-size: 12px; margin-top: 20px">
            Note: Server keys shared with other users will not be encrypted with
            your master password
          </p>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
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
      fetching: false,
      loading: false,
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
          document.title = "Members" + " | " + self.data.name;
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
    deleteItem(user) {
      this.$confirm("Delete member?").then((res) => {
        if (res) {
          var self = this;
          this.error = "";
          this.dialog = true;
          this.loading = true;

          api
            .post("teams/" + this.id + '/members', { delete: 1, user: user })
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
              self.loading = false;
            });
        }
      });
    },
  },
};
</script>