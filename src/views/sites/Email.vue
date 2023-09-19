<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-layout row v-if="authRequired">
        <v-row>
          <v-col>
            <v-card tile flat>
              <v-card-text>
                <strong>DNS auth required: </strong>
                <v-btn @click="authPrompt()">Fix</v-btn>
              </v-card-text>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-layout row v-if="!authRequired &&
        data.server &&
        data.dns &&
        data.dns.MX != data.server.hostname
        ">
        <v-row>
          <v-col cols="12">
            <v-card tile flat>
              <v-card-text>
                <strong>MX mismatch: {{ data.dns.MX }} !=
                  {{ data.server.hostname }}</strong>
                <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
              </v-card-text>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-layout row v-if="!authRequired && data.server && data.dkim && data.dkim.not_set">
        <v-row>
          <v-col cols="12">
            <v-card tile flat>
              <v-card-text>
                <strong>Missing DKIM</strong>
                <v-btn v-if="data.dkim.not_set" @click="fixDkim(data.domain)">Fix</v-btn>
              </v-card-text>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-layout row v-if="!authRequired &&
        data.server &&
        data.spf &&
        data.spf.not_set &&
        !data.spf.SPF
        ">
        <v-row>
          <v-col cols="12">
            <v-card tile flat>
              <v-card-text>
                <strong>Missing SPF</strong>
                <v-btn v-if="data.spf.not_set" @click="fixSpf(data.domain)">Fix</v-btn>
              </v-card-text>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-card-title primary-title v-if="data.server.mailserver">
        <v-switch v-model="data.email" label="Email" @change="toggleEmail()" hide-details color="primary"></v-switch>
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

    <div v-if="data.server.mailserver">
      <v-card class="mx-auto">
        <v-list>

          <v-list-item v-for="(item, i) in data.emails" :key="`item-${i}`" :title="item.name" :subtitle="item.value"
            @click="editItem(item)">

            <v-list-item-title>
              {{ item.user }}
              <span v-if="item.destination">
                <v-icon>fas fa-long-arrow-alt-right</v-icon>
                {{ item.destination }}
              </span>
            </v-list-item-title>
            <v-list-item-subtitle>{{
              prettyBytes(item.disk_usage)
            }}</v-list-item-subtitle>

            <template v-slot:append>
              <v-btn icon :disabled="fetching" :loading="fetching" @click="deleteItem(item.user)" @click.stop>
                <v-icon size="small">mdi:mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>

        </v-list>
        <v-card-actions>
          <v-btn @click="addEmail()"> Add email </v-btn>
        </v-card-actions>
      </v-card>

      <v-dialog v-model="drawer">
        <v-card>
          <v-card-title> Email account </v-card-title>

          <v-card-text>
            <v-text-field v-model="email.user" label="Name" required :readonly="userReadonly"></v-text-field>

            <v-text-field type="password" v-model="email.password" label="Password" required></v-text-field>

            <v-text-field v-model="email.destination" label="Forwarding" required></v-text-field>

            <v-btn :disabled="!email.user" :loading="fetching" color="success" @click="saveEmail()" text="Save"></v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>

    </div>
    <Confirm ref="confirm" />

  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import util from "../../services/util";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Confirm,
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
    editItem(item) {
      this.drawer = true;
      this.userReadonly = true;
      this.email = item;
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
    deleteItem: async function (user) {
      if (
        await this.$refs.confirm.open(
          "Confirm",
          "Delete " + user
        )
      ) {
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
      window.open("https://serverwand.com/account/services/" + this.data.server.dns);
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>
