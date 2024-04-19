<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list>
        <v-list-item v-for="(item, i) in data.cronjobs" :key="`item-${i}`" :title="item.command" @click="editItem(item)">

          <template v-slot:prepend>
            <v-icon v-if="item.active === false" icon="mdi:mdi-cancel"></v-icon>
          </template>

          <v-list-item-subtitle>
            {{ item.user }}
            {{ item.minute }}
            {{ item.hour }}
            {{ item.dom }}
            {{ item.mon }}
            {{ item.dow }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.line" @click.stop="deleteItem(item.line)">
              <v-icon size="small" icon="mdi:mdi-delete"></v-icon>
            </v-btn>
          </template>
        </v-list-item>

      </v-list>
    </v-card>

    <v-dialog v-model="drawer" eager max-width="600">
      <v-card>
        <v-form ref="cronjobForm">
          <v-card-title> Cronjob </v-card-title>

          <v-card-text>
            <v-switch v-model="cronjob.active" label="Active" color="primary" hide-details></v-switch>

            <v-text-field v-model="cronjob.line" label="Line" v-show="false"></v-text-field>

            <v-text-field v-model="cronjob.command" label="Command" required :rules="[rules.required]" autofocus></v-text-field>

            <v-autocomplete v-model="cronjob.user" label="User" :items="users"></v-autocomplete>

            <v-text-field v-model="cronjob.minute" label="Minute" required
              :rules="[rules.required, rules.minute]"></v-text-field>

            <v-text-field v-model="cronjob.hour" label="Hour" required
              :rules="[rules.required, rules.hour]"></v-text-field>

            <v-text-field v-model="cronjob.dom" label="Day of month" required
              :rules="[rules.required, rules.dom]"></v-text-field>

            <v-text-field v-model="cronjob.mon" label="Month" required
              :rules="[rules.required, rules.mon]"></v-text-field>

            <v-text-field v-model="cronjob.dow" label="Day of week" required
              :rules="[rules.required, rules.dow]"></v-text-field>

            <v-btn :disabled="fetching" :loading="fetching" color="success" @click="saveCronjob">
              Save
            </v-btn>
          </v-card-text>
        </v-form>
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
    Confirm,
  },
  data() {
    return {
      error: "",
      data: {
        users: {},
      },
      system_user: {
        user: "",
        password: "",
      },
      cronjob: {
        active: true,
        name: "",
        user: "",
        command: "",
        minute: "",
        hour: "",
        dom: "",
        mon: "",
        dow: "",
      },
      cronjobs: [],
      rules: {
        required: (value) => !!value || "Required",
        alpha: (v) =>
          /^[a-zA-Z-]+$/g.test(v) || "Must contain a-z characters only",
        minute: (v) => /^[0-9,/*]+$/g.test(v) || "0-59 or *",
        hour: (v) => /^[0-9,/*]+$/g.test(v) || "0-23 or *",
        dom: (v) => /^[0-9,/*]+$/g.test(v) || "1-31 or *",
        mon: (v) => /^[0-9,/*]+$/g.test(v) || "1-12 or *",
        dow: (v) => /^[0-9,/*]+$/g.test(v) || "1-7 or *",
      },
      details: "",
      fetching: false,
      loading: null,
      drawer: false,
      serverId: 0,
      logs: [
        {
          value: "journal",
          title: "Journal",
        },
        {
          value: "auth",
          title: "Auth",
        },
        {
          value: "apache_access",
          title: "Apache Access",
        },
        {
          value: "apache_error",
          title: "Apache Error",
        },
        {
          value: "mysql",
          title: "MySQL",
        },
        {
          value: "fail2ban",
          title: "Fail2ban",
        },
        {
          value: "letsencrypt",
          title: "Letsencrypt",
        },
        {
          value: "serverstatus",
          title: "Server Status",
        },
      ],
      log: "",
      logContent: "",
      users: [],
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
        .get("servers/" + this.serverId + "/cronjobs")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.data = response.data.item;
          document.title = "Cronjobs | " + this.data.name;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });

      api
        .get("servers/" + this.serverId + "/usersAndGroups")
        .then(response => {
          this.users = response.data.users;
        });
    },
    addItem() {
      this.cronjob = {
        active: false,
      };
      this.$refs.cronjobForm.resetValidation();
      this.drawer = true;
    },
    editItem(cronjob) {
      this.cronjob = JSON.parse(JSON.stringify(cronjob));
      this.drawer = true;
    },
    deleteItem: async function (line) {
      if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
        return;
      }

      this.loading = line;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/cronjobs", { line: line })
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
    },
    saveCronjob() {
      this.error = "";

      if (this.$refs.cronjobForm.validate()) {
        this.fetching = true;

        api
          .post("servers/" + this.serverId + "/cronjobs", this.cronjob)
          .then((response) => {
            console.log(response);
            if (response.data.error) {
              this.fetching = false;
              this.error = response.data.error;
            } else {
              this.drawer = false;
              this.fetchData();
            }
          })
          .catch((error) => {
            this.fetching = false;
            console.log(error);
          });
      }
    },
  },
};
</script>