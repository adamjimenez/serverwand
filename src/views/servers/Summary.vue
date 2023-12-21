<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-alert v-for="(item, i) in warnings" :key="`item-${i}`" type="warning"
      :text="item.label + ' ' + item.value + ' ' + item.suffix" class="mb-3"></v-alert>

    <v-card class="pa-3" :loading="fetching">
      <v-container class="ma-0" fluid>
        <v-layout row wrap>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card>
                <v-card-text class="pa-1">
                  <div class="d-flex justify-space-between mb-3">
                    <span class="text-h5">
                      <v-icon icon="fas fa-microchip" size="small"></v-icon>
                    </span>
                    <div class="text-subtitle-1">CPU</div>
                  </div>

                  <div class="text-h6">
                    {{ data.cores }} core<span v-if="data.cores > 1">s</span>
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
                      <v-icon icon="fas fa-memory" size="small"></v-icon>
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
                        <v-icon icon="fas fa-hdd" size="small"></v-icon>
                      </span>
                      <div class="text-subtitle-1">{{ disk.name }}</div>
                    </div>

                    <div>
                      <v-progress-linear :model-value="(1 - disk.free / disk.space) * 100" height="20"
                        :color="disk.free > 5000000 ? 'primary' : 'error'"></v-progress-linear>

                      <div :title="prettyBytes((disk.space - disk.free) * 1024) + ' used'">
                        {{ prettyBytes(disk.free * 1024) }} free of
                        {{ prettyBytes(disk.space * 1024) }}
                      </div>

                      <Logs v-if="i === 0" :serverId="serverId"></Logs>
                      <CleanUp v-if="i === 0" :serverId="serverId" @complete="fetchData(true)"></CleanUp>
                      <AttachVolume v-if="i === 0" :serverId="serverId" @complete="fetchData(true)"></AttachVolume>
                      <DetachVolume v-if="i > 0" :serverId="serverId" :volume="disk.name" @complete="fetchData(true)">
                      </DetachVolume>
                      <ResizeVolume v-if="i > 0" :serverId="serverId" :volume="disk.name" @complete="fetchData(true)">
                      </ResizeVolume>
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
                      <v-icon icon="fas fa-clock" size="small"></v-icon>
                    </span>
                    <div class="text-subtitle-1">Uptime</div>
                  </div>

                  <div class="text-body-2">
                    {{ data.uptime }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
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
                    <Terminal :serverId="serverId" @closed="fetchData(true)" cmd="sudo apt-get upgrade -y" icon>
                      <v-icon size="small">fas fa-download</v-icon>
                    </Terminal>
                  </template>
                </v-list-item>

                <v-list-item title="Hostname">
                  <v-list-item-subtitle>
                    <Copy :val="data.hostname" text />
                  </v-list-item-subtitle>
                  <template v-slot:append>
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
                    <Terminal v-if="data.upgrade_available" :title="'Upgrade to ' + data.upgrade_available"
                      cmd="sudo do-release-upgrade" icon>
                      <v-icon size="small">fas fa-rocket</v-icon>
                    </Terminal>
                    <UpdatesConfig :serverId="serverId" />
                  </template>
                </v-list-item>

                <v-list-item title="Kernel version" :subtitle="data.kernel"></v-list-item>

                <v-list-item title="Apache" :subtitle="data.apache">
                  <template v-slot:append>

                    <Terminal title="GoAccess Web Log Analyzer"
                      cmd="sudo awk '$8=$1$8' /var/log/apache2/other_vhosts_access.log /var/log/apache2/other_vhosts_access.log.1 | goaccess --log-format VCOMBINED -a -"
                      icon>
                      <v-icon size="small">fas fa-chart-line</v-icon>
                    </Terminal>

                    <ApacheConfig :serverId="serverId" />
                  </template>
                </v-list-item>

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

                <v-list-item title="Postfix" :subtitle="data.postfix">
                  <template v-slot:append>
                    <PostfixConfig :serverId="serverId" />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col></v-row>
      </v-layout>

      <v-container fluid class="ma-0">
        <ResourceGraph :serverId="serverId"></ResourceGraph>
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
import ApacheConfig from "../../components/ApacheConfig";
import PostfixConfig from "../../components/PostfixConfig";
import CleanUp from "../../components/CleanUp";
import UpdatesConfig from "../../components/UpdatesConfig";
import TimeZone from "../../components/TimeZone";
import Terminal from "../../components/Terminal";
import ResourceGraph from "../../components/ResourceGraph";
import AttachVolume from "../../components/AttachVolume";
import DetachVolume from "../../components/DetachVolume";
import ResizeVolume from "../../components/ResizeVolume";
import Logs from "../../components/Logs";

export default {
  components: {
    Copy,
    Edit,
    PhpConfig,
    MysqlConfig,
    ApacheConfig,
    PostfixConfig,
    CleanUp,
    UpdatesConfig,
    TimeZone,
    Terminal,
    ResourceGraph,
    AttachVolume,
    DetachVolume,
    ResizeVolume,
    Logs,
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
  computed: {
    warnings: function () {
      let warnings = [];

      this.data.health?.checks.forEach(item => {
        if (item.failed) {
          warnings.push(item);
        }
      });

      return warnings;
    }
  }
};
</script>