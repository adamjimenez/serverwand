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
            logs: [],
            log: null,
            logContent: "",
            filter: '',            
        };
    },
    created() {
        // fetch the data when the view is created and the data is
        // already being observed
        this.serverId = this.$route.params.id;

        window.onhashchange = async () => {
            let path = location.hash.substr(1);

            if (!path) {
                return;
            }

            let file = path;
            let line = 1;
            if (file.indexOf(':') !== -1) {
                let arr = file.split(':');
                file = arr[0];
                line = arr[1];
            }

            this.fecthing = true;
            await this.$refs.editFile.open({
                id: file,
                name: file,
            });

            this.$refs.editFile.goToLine(line);
            location.hash = '';
        };
    },
    computed: {
        filteredLog: function () {
            const pathRegex = /(\/(var|etc)[^\s:\\']+( on line [0-9]+))/g;
            const findRegex = this.filter ? RegExp(`\(${this.filter})\+`, 'gi') : /NOMATCH/;

            let lines = this.logContent.split("\n");
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
        fetchLog: async function(log) {
            if (log) {
                this.log = log;
            }

            this.fetching = true;

            await this.$nextTick();

            let scrollEl = document.querySelector('.v-dialog .v-card-text')
            let scrollTop = scrollEl?.scrollTop;

            this.logContent = "";

            api
                .post("servers/" + this.serverId + "/fetchlog", { log: this.log })
                .then(async (response) => {
                    if ('content' in response.data) {
                        this.logContent = response.data.content;
                    }

                    if (response.data.logs) {
                        this.logs = response.data.logs;
                    }

                    await this.$nextTick();

                    if (scrollEl) {
                        scrollEl.scrollTop = scrollTop;
                    }
                })
                .finally(() => {
                    this.fetching = false;
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