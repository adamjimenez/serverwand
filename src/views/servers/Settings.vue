<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="fetching" />

    <v-card class="pa-3">
      <v-row>
        <v-col>
          <div class="ma-3">
            <v-btn @click="editServer"> Edit </v-btn>
            <Reboot :serverId="serverId" class="mx-3" />
            <Disconnect :serverId="serverId" :server="data" />
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="ma-3 pa-3">
      <v-card-title>
        Notifications
      </v-card-title>

      <v-form ref="form">
        
        <v-container>
          <v-row>
            <v-col>
              <v-switch v-model="data.notifications.disk_usage.active" label="Disk usage"></v-switch>
              <div>
                Percentage of disk usage. Exceeding this value triggers an alert.
              </div>
            </v-col>
            <v-col>
              <v-text-field v-model="data.notifications.disk_usage.threshold" label="Usage threshold" value="90" min="0"
                max="100" type="number" suffix="%" :disabled="!data.notifications.disk_usage.active" />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-switch v-model="data.notifications.mail_queue.active" label="Mail queue"></v-switch>
              <div>
                Length of mail queue. Exceeding this value triggers an alert.
              </div>
            </v-col>
            <v-col>
              <v-text-field v-model="data.notifications.mail_queue.threshold" label="Mail queue threshold" value="100"
                min="0" type="number" suffix="Emails" :disabled="!data.notifications.mail_queue.active" />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-switch v-model="data.notifications.db_connections.active" label="Database connection usage"></v-switch>
              <div>
                Percentage of used database connections. Exceeding this value triggers an alert.
              </div>
            </v-col>
            <v-col>
              <v-text-field v-model="data.notifications.db_connections.threshold" label="Connection threshold"
                value="100" min="0" max="100" type="number" suffix="%"
                :disabled="!data.notifications.db_connections.active" />
            </v-col>
          </v-row>
        </v-container>


        <v-btn color="success my-5" @click="saveNotifications">
          Save
        </v-btn>

      </v-form>


    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Reboot from "../../components/Reboot";
import Disconnect from "../../components/Disconnect";

export default {
  components: {
    Loading,
    Reboot,
    Disconnect,
  },
  data() {
    return {
      error: "",
      fetching: false,
      serverId: 0,
      data: {
        notifications: {
          disk_usage: {},
          mail_queue: {},
          db_connections: {},
        }
      },
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData(clearCacheEntry) {
      var self = this;
      this.error = "";

      //this.fetching = true

      api
        .get("servers/" + this.serverId + "?detailed=1", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }

          if (response.data.item) {
            self.data = response.data.item;
            document.title = "Settings | " + self.data.name;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    editServer() {
      this.$router.push("/servers/" + this.$route.params.id + "/edit");
    },
    saveNotifications() {
      let self = this;

      this.fetching = true;

      api
        .post(
          "servers/" + this.serverId + "/notifications",
          {
            notifications: self.data.notifications
          }
        )
        .then(function (response) {
          if (response.data.error) {
            self.error = response.data.error
            return false
          }

          self.fetchData(true)
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    }
  },
};
</script>
