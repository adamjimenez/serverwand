<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-card class="pa-3" :loading="fetching">
      <v-container class="ma-0" fluid>
        <v-layout row wrap>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card>
                <v-card-text class="pa-1">
                  <div class="d-flex justify-space-between mb-3">
                    <span class="text-h5">
                      <i class="fas fa-microchip"></i>
                    </span>
                    <div class="text-subtitle-1">CPU</div>
                  </div>

                  <div class="text-h6">
                    {{ data.cores }} core<span v-if="data.cores > 1">s</span><br>
                  </div>
                  <div class="text-body-2">
                    {{ data.cpu }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card>
                <v-card-text class="pa-1">
                  <div class="d-flex justify-space-between mb-3">
                    <span class="text-h5">
                      <i class="fas fa-memory"></i>
                    </span>
                    <div class="text-subtitle-1">Memory Usage</div>
                  </div>

                  <v-progress-linear :model-value="data.mem_perc" height="20" color="primary"></v-progress-linear>

                  <div>
                    {{ prettyBytes(data.mem_free * 1024) }} free of
                    {{ prettyBytes(data.mem_total * 1024) }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <template v-for="(disk, i) in data.disks" :key="`item-${i}`">
              <v-col cols="12" sm="6" md="3">
                <v-card>
                  <v-card-text class="pa-1">
                    <div class="d-flex justify-space-between mb-3">
                      <span class="text-h5">
                        <i class="fas fa-hdd"></i>
                      </span>
                      <div class="text-subtitle-1">{{ disk.name }}</div>
                    </div>

                    <div>
                      <v-progress-linear :model-value="(1 - disk.free / disk.space) * 100" height="20"
                        color="primary"></v-progress-linear>

                      <div>
                        {{ prettyBytes(disk.free * 1024) }} free of
                        {{ prettyBytes(disk.space * 1024) }}
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </template>

            <v-col cols="12" sm="6" md="3">
              <v-card>
                <v-card-text class="pa-1">
                  <div class="d-flex justify-space-between mb-3">
                    <span class="text-h5">
                      <i class="fas fa-clock"></i>
                    </span>
                    <div class="text-subtitle-1">Uptime</div>
                  </div>

                  <div class="text-body-2">
                    {{ data.uptime }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col></v-row>
        </v-layout>
      </v-container>

      <v-layout row class="mx-1">
        <v-row>
          <v-col cols="12" sm="6">
            <v-card max-width="400">
              <v-list lines="two">
                <v-list-item v-if="data.updates >= 0" title="Updates"
                  :subtitle="data.updates + ' updates, ' + data.security_updates + ' security updates.' + (data.reboot_required ? ' Reboot required.' : '')">
                  <template v-slot:append>
                    <Terminal :serverId="serverId" @closed="fetchData(true)" cmd="sudo%20apt-get%20upgrade%20-y">
                      <v-icon small>fas fa-download</v-icon>
                    </Terminal>
                    <UpdatesConfig />
                  </template>
                </v-list-item>

                <v-list-item title="Hostname" :subtitle="data.hostname">
                  <template v-slot:append>
                    <Copy :val="data.hostname" />
                    <Edit :val="data.hostname" hideText label="Hostname" name="hostname"
                      :path="'servers/' + this.serverId + '/hostname'" @save="fetchData(true)" />
                  </template>
                </v-list-item>

                <v-list-item title="IP address">
                  <v-list-item-subtitle>
                    <Copy :val="data.ip" text />
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item title="IPv6 address">
                  <v-list-item-subtitle>
                    <Copy :val="data.ipv6" text />
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item title="Time Zone" :subtitle="data.timeZone">
                  <template v-slot:append>
                    <TimeZone :serverId="serverId" @save="fetchData(true)" />
                  </template>
                </v-list-item>
              </v-list>

            </v-card>
          </v-col>

          <v-col cols="12" sm="6">
            <v-card max-width="400">
              <v-list lines="two">
                <v-list-item title="Operating system" :subtitle="data.os">
                  <template v-slot:append>
                    <Terminal v-if="data.upgrade_available" :title="'Upgrade to ' + data.upgrade_available" cmd="sudo%20do-release-upgrade">
                      <v-icon small>fas fa-rocket</v-icon>
                    </Terminal>
                  </template>
                </v-list-item>

                <v-list-item title="Kernel version" :subtitle="data.kernel"></v-list-item>

                <v-list-item title="Apache" :subtitle="data.apache"></v-list-item>

                <v-list-item title="PHP" :subtitle="data.php">
                  <template v-slot:append>
                    <PhpConfig :serverId="serverId" />
                  </template>
                </v-list-item>

                <v-list-item title="MariaDb" :subtitle="data.mariadb">
                  <template v-slot:append>
                    <MysqlConfig :serverId="serverId" />
                  </template>
                </v-list-item>

                <v-list-item title="Postfix" :subtitle="data.postfix"></v-list-item>
              </v-list>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-container class="ma-0">
        <v-layout row wrap>
          <svg width="100%" viewBox="0 0 1060 400" v-html="data.graph"></svg>
        </v-layout>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import util from "../../services/util";
import Copy from "../../components/Copy";
import Edit from "../../components/Edit";
import PhpConfig from "../../components/PhpConfig";
import MysqlConfig from "../../components/MysqlConfig";
import CleanUp from "../../components/CleanUp";
import UpdatesConfig from "../../components/UpdatesConfig";
import TimeZone from "../../components/TimeZone";
import Terminal from "../../components/Terminal";

export default {
  components: {
    Copy,
    Edit,
    PhpConfig,
    MysqlConfig,
    CleanUp,
    UpdatesConfig,
    TimeZone,
    Terminal,
  },
  data() {
    return {
      error: "",
      data: {
        disk_free: 0,
        disk_space: 0,
        mem_free: 0,
        mem_total: 0,
        mem_perc: 0,
        graph: "",
      },
      details: "",
      fetching: false,
      serverId: 0,
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData(clearCacheEntry) {
      var self = this;
      this.error = "";
      this.fetching = true;
      this.serverId = this.$route.params.id;

      api
        .get("servers/" + this.serverId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(response => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }

          if (response.data.item) {
            self.data = response.data.item;
          }

          if (self.data.mem_total) {
            self.data.mem_perc = Math.round(
              (1 - self.data.mem_free / self.data.mem_total) * 100
            );
          }

          self.hostname = self.data.hostname;

          document.title = "Summary | " + self.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    }
  },
};
</script>