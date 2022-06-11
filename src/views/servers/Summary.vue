<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-card class="pa-3" :loading="fetching">
      <v-container class="ma-0">
        <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                      <i class="fas fa-microchip"></i>
                    </div>

                    <div class="label">CPU</div>
                  </div>

                  <div class="pt-3" style="clear: both; font-size: 12px">
                    <div style="font-size: 20px">
                      {{ data.cores }} core<span v-if="data.cores > 1">s</span>
                    </div>
                    {{ data.cpu }}
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>

          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                      <i class="fas fa-memory"></i>
                    </div>

                    <div class="label">Memory Usage</div>
                  </div>

                  <div class="pt-3" style="clear: both">
                    <v-list-item-title>
                      <v-progress-linear
                        :value="data.mem_perc"
                        height="20"
                      ></v-progress-linear>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ (data.mem_free * 1024) | prettyBytes }} free of
                      {{ (data.mem_total * 1024) | prettyBytes }}
                    </v-list-item-subtitle>
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>

          <template v-for="(disk, i) in data.disks">
            <v-flex xs12 sm6 md3 :key="`item-${i}`" :value="disk">
              <v-card>
                <div class="feature">
                  <v-card-text>
                    <div>
                      <div class="icon">
                        <i class="fas fa-hdd"></i>
                      </div>

                      <div class="label">{{ disk.name }}</div>
                    </div>

                    <div class="pt-3" style="clear: both">
                      <v-list-item-title>
                        <v-progress-linear
                          :value="(1 - disk.free / disk.space) * 100"
                          height="20"
                        ></v-progress-linear>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (disk.free * 1024) | prettyBytes }} free of
                        {{ (disk.space * 1024) | prettyBytes }}
                      </v-list-item-subtitle>
                    </div>
                  </v-card-text>
                </div>
              </v-card>
            </v-flex>
          </template>

          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                      <i class="fas fa-clock"></i>
                    </div>

                    <div class="label">Uptime</div>
                  </div>

                  <div class="pt-3" style="clear: both; font-size: 14px">
                    {{ data.uptime }}
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

      <v-layout row class="mx-1">
        <v-flex md6 xs12>
          <v-card>
            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`Updates`"></v-list-item-title>
                  <v-list-item-subtitle v-if="data.updates >= 0">
                    <div>
                      {{ data.updates }} updates,
                      {{ data.security_updates }} security updates.
                      <span v-if="data.reboot_required">Reboot required.</span>
                    </div>

                    <Upgrade :serverId="serverId" @closed="fetchData(true)" />

                    <UpdatesConfig :serverId="serverId" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`Hostname`"></v-list-item-title>
                  <v-list-item-subtitle v-if="data.hostname">
                    <Copy :val="data.hostname" text />
                    <Edit
                      :val="data.hostname"
                      hideText
                      label="Hostname"
                      name="hostname"
                      :path="'servers/' + this.serverId + '/hostname'"
                      @save="fetchData(true)"
                    />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`IP address`"></v-list-item-title>
                  <v-list-item-subtitle>
                    <Copy :val="data.ip" text />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    v-html="`IPv6 address`"
                  ></v-list-item-title>
                  <v-list-item-subtitle>
                    <Copy :val="data.ipv6" text />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-flex>

        <v-flex xs6>
          <v-card>
            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    v-html="`Operating system`"
                  ></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ data.os }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    v-html="`Kernel version`"
                  ></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ data.kernel }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`Apache`"></v-list-item-title>
                  <v-list-item-subtitle
                    v-html="data.apache"
                  ></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`PHP`"></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ data.php }}
                    <PhpConfig :serverId="serverId" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`MariaDb`"></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ data.mariadb }}
                    <MysqlConfig :serverId="serverId" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-html="`Postfix`"></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ data.postfix }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-flex>
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
import Copy from "../../components/Copy";
import Edit from "../../components/Edit";
import PhpConfig from "../../components/PhpConfig";
import MysqlConfig from "../../components/MysqlConfig";
import CleanUp from "../../components/CleanUp";
import Upgrade from "../../components/Upgrade";
import UpdatesConfig from "../../components/UpdatesConfig";

export default {
  components: {
    Copy,
    Edit,
    PhpConfig,
    MysqlConfig,
    CleanUp,
    Upgrade,
    UpdatesConfig,
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
        .then(function (response) {
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
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>

<style>
.serverstatus {
  all: initial;
}

.feature {
  min-height: 140px;
}

.icon {
  font-size: 30px;
  float: left;
}

.label {
  float: right;
  font-size: 12px;
}
</style>