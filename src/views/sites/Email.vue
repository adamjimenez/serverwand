<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-layout row v-if="authRequired">
        <v-flex xs12>
          <v-card tile flat>
            <v-card-text>
              <strong>DNS auth required: </strong>
              <v-btn @click="authPrompt()">Fix</v-btn>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout
        row
        v-if="
          !authRequired &&
          data.server &&
          data.dns &&
          data.dns.MX != data.server.hostname
        "
      >
        <v-flex xs12>
          <v-card tile flat>
            <v-card-text>
              <strong
                >MX mismatch: {{ data.dns.MX }} !=
                {{ data.server.hostname }}</strong
              >
              <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)"
                >Fix</v-btn
              >
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout
        row
        v-if="!authRequired && data.server && data.dkim && data.dkim.not_set"
      >
        <v-flex xs12>
          <v-card tile flat>
            <v-card-text>
              <strong>Missing DKIM</strong>
              <v-btn v-if="data.dkim.not_set" @click="fixDkim(data.domain)"
                >Fix</v-btn
              >
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout
        row
        v-if="
          !authRequired &&
          data.server &&
          data.spf &&
          data.spf.not_set &&
          !data.spf.SPF
        "
      >
        <v-flex xs12>
          <v-card tile flat>
            <v-card-text>
              <strong>Missing SPF</strong>
              <v-btn v-if="data.spf.not_set" @click="fixSpf(data.domain)"
                >Fix</v-btn
              >
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-card-title primary-title>
        <v-switch
          v-model="data.email"
          label="Email"
          @change="toggleEmail()"
        ></v-switch>
      </v-card-title>
    </v-card>

    <!--
      <v-card
          class="mx-auto"
      >
        <v-card-text>
          <p>IMAP server: {{data.server.hostname}}:143</p>
          <p>SMTP server: {{data.server.hostname}}:25</p>
        </v-card-text>
      </v-card>
-->

    <v-card class="mx-auto">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in data.emails">
            <v-list-item :key="`item-${i}`" :value="item" @click="editEmail(i)">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.user }}
                    <span v-if="item.destination">
                      <v-icon>fas fa-long-arrow-alt-right</v-icon>
                      {{ item.destination }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{
                    item.disk_usage | prettyBytes
                  }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
                    @click="deleteEmail(item.user)"
                    @click.stop
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
      <v-card-text>
        <v-btn @click="addEmail()"> Add email </v-btn>
      </v-card-text>
    </v-card>

    <v-navigation-drawer v-model="drawer" fixed temporary right>
      <v-card>
        <v-card-title> Email account </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="email.user"
            label="Name"
            required
            :readonly="userReadonly"
          ></v-text-field>

          <v-text-field
            type="password"
            v-model="email.password"
            label="Password"
            required
          ></v-text-field>

          <v-text-field
            v-model="email.destination"
            label="Forwarding"
            required
          ></v-text-field>

          <v-btn
            :disabled="fetching"
            :loading="fetching"
            color="success"
            @click="saveEmail()"
          >
            Save
          </v-btn>
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
      domainId: null,
      post: null,
      error: null,
      data: {
        email: false,
        emails: [],
        server: {},
        records: {},
      },
      email: {},
      fetching: false,
      loading: false,
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      copyText: "Copy",
      drawer: false,
      userReadonly: false,
      timer: null,
      authRequired: false,
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
    fetchData() {
      var self = this;
      this.error = "";
      this.domainId = this.$route.params.id;
      clearTimeout(self.timer);
      this.fetching = true;

      api
        .get("sites/" + this.domainId + "/email?v=" + Date.now())
        .then(function (response) {
          console.log(response);

          self.data = response.data.item;
          document.title = "Email" + " | " + self.data.domain;

          if (self.data.dns.updating) {
            console.log("checking dns");
            self.timer = setTimeout(self.fetchData, 60000);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    toggleEmail() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.domainId + "/email", {
          update: 1,
          status: this.data.email,
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
    addEmail() {
      this.drawer = true;
      this.userReadonly = false;
      this.email = {};
    },
    editEmail(index) {
      this.drawer = true;
      this.userReadonly = true;
      this.email = this.data.emails[index];
    },
    saveEmail() {
      var self = this;

      if (this.email.user) {
        this.loading = true;
        this.error = "";

        api
          .post("sites/" + this.domainId + "/email", this.email)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
              self.loading = false;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(function () {
            self.loading = false;
          });
      }
    },
    deleteEmail(user) {
      this.$confirm("Delete " + user + "?").then((res) => {
        if (res) {
          var self = this;
          this.loading = true;
          this.error = "";

          api
            .post("sites/" + this.domainId + "/email", {
              delete: 1,
              user: user,
            })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.error = response.data.error;
                self.loading = false;
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.loading = false;
            });
        }
      });
    },
    fixDomainDns() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + self.domainId + "/fixmx", {})
        .then(function (response) {
          console.log(response);

          self.loading = false;

          if (!response.data.success) {
            if (response.data.error == "auth") {
              self.authRequired = true;
            } else {
              self.error = response.data.error;
            }
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    fixDkim() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + self.domainId + "/fixdkim", {})
        .then(function (response) {
          console.log(response);

          self.loading = false;

          if (!response.data.success) {
            if (response.data.error == "auth") {
              self.authRequired = true;
            } else {
              self.error = response.data.error;
            }
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    fixSpf() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + self.domainId + "/fixspf", {})
        .then(function (response) {
          console.log(response);

          self.loading = false;

          if (!response.data.success) {
            if (response.data.error == "auth") {
              self.authRequired = true;
            } else {
              self.error = response.data.error;
            }
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    authPrompt() {
      this.authRequired = false;
      window.open(
        "https://serverwand.com/account/services/" + this.data.server.dns
      );
    },
  },
};
</script>
