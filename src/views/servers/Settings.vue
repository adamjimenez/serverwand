<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="fetching" />

    <v-card>
      <v-card-text>
        <v-row>
          <v-btn @click="editServer"> Edit </v-btn>
          <Reboot :serverId="serverId" class="mx-3" />
          <Disconnect :serverId="serverId" :server="data" />
        </v-row>
      </v-card-text>
    </v-card>

    <v-card :loading="fetching" title="Notifications">
      <v-form ref="form">
        <v-container fluid>
          <v-row v-for="(item, i) in data.health?.checks" :key="`item-${i}`">
            <v-col>
              <v-switch v-model="item.active" :label="item.label" color="primary" :messages="item.description"></v-switch>
            </v-col>
            <v-col>
              <v-text-field v-model="item.threshold" label="Threshold" min="0" max="100" type="number"
                :suffix="item.suffix" :disabled="!item.active" />
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-btn color="success my-5" @click="saveNotifications" :disabled="!changed">Save</v-btn>
        </v-card-actions>
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
          disk_space: {},
          mail_queue: {},
          db_connections: {},
        },
        disks: [],
      },
      orig: {}
    };
  },
  computed: {
    changed: function () {
      return JSON.stringify(this.data) !== JSON.stringify(this.orig)
    }
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData(clearCacheEntry) {
      this.error = "";
      this.fetching = true

      api
        .get("servers/" + this.serverId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          }

          if (response.data.item) {
            this.data = response.data.item;
            this.orig = JSON.parse(JSON.stringify(response.data.item));
            document.title = "Settings | " + this.data.name;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    editServer() {
      this.$router.push("/servers/" + this.$route.params.id + "/edit");
    },
    saveNotifications() {
      this.fetching = true;

      api
        .post(
          "servers/" + this.serverId + "/notifications", {
          notifications: this.data.health.checks
        })
        .then((response) => {
          if (response.data.error) {
            this.error = response.data.error
            return false
          }

          this.fetchData(true)
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
  },
};
</script>
