<template>
    <span>
        <v-btn icon @click="logContent = ''; showLogs = true; fetchLog();" title="Server Logs">
            <v-icon size="small">fas fa-file-alt</v-icon>
        </v-btn>

        <EditFile ref="editFile" :serverId="serverId" action="files" @complete="fetchLog()" @error="handleError"
            @loading="handleLoading" />

        <v-dialog scrollable v-model="showLogs" min-height="95%">
            <v-card :loading="fetching">
                <v-card-title primary-title>
                    <v-row>
                        <v-select :items="logs" label="Log" v-model="log" @update:modelValue="fetchLog" hide-details
                            class="ma-1"></v-select>

                        <v-text-field label="Filter" v-model="filter" hide-details class="ma-1"></v-text-field>

                        <v-btn @click="fetchLog()" :disabled="!log" icon class="ma-3">
                            <v-icon :class="fetching ? 'fa-spin' : ''" size="small">fas fa-redo-alt</v-icon>
                        </v-btn>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <div v-if="log == 'serverstatus'" v-html="logContent" class="serverstatus"></div>
                    <div class="pre" v-else v-html="filteredLog"></div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </span>
</template>
  
<script>
import api from "../services/api";
import EditFile from "./Files/EditFile";

export default {
    components: {
        EditFile,
    },
    data() {
        return {
            showLogs: false,
            error: "",
            data: {},
            details: "",
            fetching: true,
            serverId: 0,
            logs: [{
                value: "apache_access",
                title: "Apache Access",
            }, {
                value: "apache_error",
                title: "Apache Error",
            }, {
                value: "other_vhosts",
                title: "Apache Other Vhosts",
            }, {
                value: "auth",
                title: "Auth",
            }, {
                value: "fail2ban",
                title: "Fail2ban",
            }, {
                value: "journal",
                title: "Journal",
            }, {
                value: "letsencrypt",
                title: "Let's Encrypt",
            }, {
                value: "mail",
                title: "Mail",
            }, {
                value: "mysql",
                title: "MySQL",
            }, {
                value: "serverstatus",
                title: "Server Status",
            }],
            log: "apache_error",
            logContent: "",
            filter: '',
        };
    },
    created() {
        // fetch the data when the view is created and the data is
        // already being observed
        this.serverId = this.$route.params.id;
        this.fetchData();

        var self = this;

        window.onhashchange = async function () {
            var path = location.hash.substr(1);

            if (!path) {
                return;
            }

            var file = path;
            var line = 1;
            if (file.indexOf(':') !== -1) {
                var arr = file.split(':');
                file = arr[0];
                line = arr[1];
            }

            self.fecthing = true;
            await self.$refs.editFile.open({
                id: file,
                name: file,
            });

            self.$refs.editFile.goToLine(line);
            location.hash = '';
        };
    },
    computed: {
        filteredLog: function () {
            const pathRegex = /(\/(var|etc)[^\s:\\']+( on line [0-9]+))/g;
            const findRegex = this.filter ? RegExp(`\(${this.filter})\+`, 'gi') : /NOMATCH/;

            var lines = this.logContent.split("\n");
            return lines.filter((line) => line.toLowerCase().
                includes(this.filter.toLowerCase())).
                join("\n").
                replace(findRegex, '<strong>$1</strong>').
                replace(pathRegex, '<a href="' + location.pathname + '#$1">$1</a>').
                replace(/( on line )([0-9]+)/g, ':$2').
                replace(/(PHP Fatal error)/g, '<span class="error">$1</span>').
                replace(/(PHP Parse error)/g, '<span class="error">$1</span>').
                replace(/(PHP Warning)/g, '<span class="warning">$1</span>');
        }
    },
    methods: {
        fetchData() {
            var self = this;
            this.error = "";
            this.fetching = true;

            api
                .get("servers/" + this.serverId)
                .then(function (response) {
                    console.log(response);

                    if (response.data.error) {
                        self.error = response.data.error;
                        return false;
                    }

                    self.data = response.data.item;
                    document.title = "Logs" + " | " + self.data.name;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.fetching = false;
                });
        },
        fetchLog: async function(log) {
            var self = this;

            if (log) {
                self.log = log;
            } else if (!self.log) {
                return;
            }

            this.fetching = true;

            await this.$nextTick();

            let scrollEl = document.querySelector('.v-dialog .v-card-text')
            let scrollTop = scrollEl.scrollTop;

            this.logContent = "loading..";

            api
                .post("servers/" + this.serverId + "/fetchlog", { log: self.log })
                .then(async function (response) {
                    console.log(response);
                    self.logContent = response.data.content;
                    await self.$nextTick();
                    scrollEl.scrollTop = scrollTop;
                })
                .finally(function () {
                    self.fetching = false;
                });
        },
        handleError(error) {
            this.error = error;
        },
        handleLoading(loading) {
            this.fetching = loading;
        },
    },
};
</script>

<style>
.pre {
  font-family: monospace;
  white-space: pre-wrap;
}

.pre strong {
  background: yellow;
  color: #000;
}
</style>