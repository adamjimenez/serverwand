<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in data.cronjobs">
            <v-list-item
              :key="`item-${i}`"
              :value="item"
              @click="editItem(item)"
            >
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-icon v-if="item.active === false">block</v-icon>
                    {{ item.command }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.user }}
                    {{ item.minute }}
                    {{ item.hour }}
                    {{ item.dom }}
                    {{ item.mon }}
                    {{ item.dow }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
                    @click="deleteItem(item.line)"
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
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add cron job </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="cronjobDrawer" temporary right>
      <v-card>
        <v-form ref="cronjobForm">
          <v-card-title> Cronjob </v-card-title>

          <v-card-text>
            <v-switch v-model="cronjob.active" label="Active"></v-switch>

            <v-text-field
              v-model="cronjob.line"
              label="Line"
              v-show="false"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.command"
              label="Command"
              required
              :rules="[rules.required]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.user"
              label="User"
              required
              :rules="[rules.required, rules.alpha]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.minute"
              label="Minute"
              required
              :rules="[rules.required, rules.minute]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.hour"
              label="Hour"
              required
              :rules="[rules.required, rules.hour]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.dom"
              label="Day of month"
              required
              :rules="[rules.required, rules.dom]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.mon"
              label="Month"
              required
              :rules="[rules.required, rules.mon]"
            ></v-text-field>

            <v-text-field
              v-model="cronjob.dow"
              label="Day of week"
              required
              :rules="[rules.required, rules.dow]"
            ></v-text-field>

            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="saveCronjob"
            >
              Save
            </v-btn>
          </v-card-text>
        </v-form>
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
        required: (value) => !!value || "Required.",
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
      loading: false,
      cronjobDrawer: false,
      serverId: 0,
      logs: [
        {
          value: "journal",
          text: "Journal",
        },
        {
          value: "auth",
          text: "Auth",
        },
        {
          value: "apache_access",
          text: "Apache Access",
        },
        {
          value: "apache_error",
          text: "Apache Error",
        },
        {
          value: "mysql",
          text: "MySQL",
        },
        {
          value: "fail2ban",
          text: "Fail2ban",
        },
        {
          value: "letsencrypt",
          text: "Letsencrypt",
        },
        {
          value: "serverstatus",
          text: "Server Status",
        },
      ],
      log: "",
      logContent: "",
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
        .get("servers/" + this.serverId + "/cronjobs")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data.item;
          document.title = "Cronjobs" + " | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.cronjob = {};
      this.$refs.cronjobForm.resetValidation();
      this.cronjobDrawer = true;
    },
    editItem(cronjob) {
      this.cronjob = JSON.parse(JSON.stringify(cronjob));
      this.cronjobDrawer = true;
    },
    deleteItem(line) {
      this.$confirm("Delete cron job?").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;
          this.error = "";

          api
            .post("servers/" + this.serverId + "/cronjobs", { line: line })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.fetching = false;
                self.error = response.data.error;
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              self.fetching = false;
              console.log(error);
            });
        }
      });
    },
    saveCronjob() {
      var self = this;
      this.error = "";

      if (this.$refs.cronjobForm.validate()) {
        this.fetching = true;

        api
          .post("servers/" + this.serverId + "/cronjobs", this.cronjob)
          .then(function (response) {
            console.log(response);
            if (response.data.error) {
              self.fetching = false;
              self.error = response.data.error;
            } else {
              self.cronjobDrawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            self.fetching = false;
            console.log(error);
          });
      }
    },
  },
};
</script>
