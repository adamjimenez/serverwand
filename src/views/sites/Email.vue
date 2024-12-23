<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

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


    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addEmail()" icon="mdi:mdi-plus" v-if="data.server.mailserver"></v-btn>

        <v-btn v-if="data.dns?.not_set" @click="fixDNS('mx', data.dns)"
          :title="data.dns.MX + ' != ' + data.server.hostname">Fix MX mismatch</v-btn>

        <v-btn v-if="data.dkim?.not_set" @click="fixDNS('dkim', data.dkim)">Fix DKIM</v-btn>

        <v-btn v-if="data.spf?.not_set" @click="fixDNS('spf', data.spf)">Fix SPF</v-btn>

        <v-btn v-if="data.dmarc?.not_set" @click="fixDNS('dmarc', data.dmarc)">Fix DMARC</v-btn>

        <v-switch v-if="data.server.mailserver" v-model="data.email" label="Email" @change="toggleEmail()" hide-details
          color="primary"></v-switch>
      </v-card-actions>
    </v-card>

    <v-card class="mx-auto">
      <v-list max-width="600">

        <v-list-item v-for="(item, i) in data.emails" :key="`item-${i}`" :title="item.name" :subtitle="item.value"
          @click="editItem(item)">

          <v-list-item-title>
            {{ item.user }}
            <span v-if="item.destination">
              <v-icon>fas fa-long-arrow-alt-right</v-icon>
              {{ item.destination }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ prettyBytes(item.disk_usage) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.user" @click="deleteItem(item.user)"
              @click.stop>
              <v-icon size="small" icon="mdi:mdi-delete"></v-icon>
            </v-btn>
          </template>
        </v-list-item>

      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Email account">
        <v-card-text>
          <v-text-field v-model="email.user" label="Name" required :readonly="userReadonly" autofocus></v-text-field>
          <PasswordField v-model="email.password" label="Password" required></PasswordField>
          <v-text-field v-model="email.destination" label="Forwarding" required></v-text-field>
          <v-btn :disabled="!email.user" :loading="fetching" color="success" @click="saveEmail()" text="Save"></v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dnsDialog" max-width="600">
      <v-card :title="'Fix ' + dnsData.fix">
        <v-card-text>
          <p>
            Add the following record to <strong>{{ dnsData.nameserver }}</strong>
          </p>

          <v-list>
            <v-list-item title="Type">
              <template v-slot:subtitle>
                <Copy :val="dnsData.record.type" text />
              </template>             
            </v-list-item>
            <v-list-item title="Hostname">
              <template v-slot:subtitle>
                <Copy :val="dnsData.record.hostname" text />
              </template>             
            </v-list-item>
            <v-list-item title="Value">
              <template v-slot:subtitle>
                <Copy :val="dnsData.record.value" text />
              </template>             
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <Confirm ref="confirm" />
    <OAuth ref="oauth" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import util from "../../services/util";
import Confirm from "../../components/ConfirmDialog.vue";
import PasswordField from "../../components/PasswordField.vue";
import OAuth from "../../components/OAuth.vue";
import Copy from "../../components/Copy";

export default {
  components: {
    Loading,
    Confirm,
    PasswordField,
    OAuth,
    Copy,
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
      loading: null,
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
      dnsDialog: false,
      dnsData: {},
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
      this.error = "";
      this.domainId = this.$route.params.id;
      clearTimeout(this.timer);
      this.fetching = true;

      api
        .get("sites/" + this.domainId + "/email?v=" + Date.now())
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return;
          }

          this.data = response.data.item;
          document.title = "Email" + " | " + this.data.domain;

          if (this.data.dns.updating) {
            console.log("checking dns");
            this.timer = setTimeout(this.fetchData, 60000);
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    toggleEmail() {
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.domainId + "/email", {
          update: 1,
          status: this.data.email,
        })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else if (response.data.success) {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
          this.loading = false;
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
      this.email = {...item};
    },
    saveEmail() {
      if (!this.email.user) {
        return;
      }

      this.loading = true;
      this.error = "";

      api
        .post("sites/" + this.domainId + "/email", this.email)
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
            this.loading = false;
          } else {
            this.drawer = false;
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    deleteItem: async function (user) {
      if (!await this.$refs.confirm.open("Delete " + user)) {
        return;
      }

      this.error = "";
      this.loading = user;

      api
        .post("sites/" + this.domainId + "/email", {
          delete: 1,
          user: user,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
            this.loading = false;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
          this.loading = null;
        });
    },
    fixDNS(fix, data) {
      if (!data.fixable) {
        this.dnsDialog = true;
        this.dnsData = data
        this.dnsData.fix = fix;
        return;
      }

      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.domainId + "/fix" + fix, {})
        .then(async (response) => {
          console.log(response);

          this.loading = false;

          switch (await this.$refs.oauth.check(response.data)) {
            case true:
              return this.fixDNS(fix);
            case false:
              return;
          }

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
};
</script>
