<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <EditFile ref="editFile" :serverId="serverId" action="files" @complete="fetchLog()" @error="handleError"
      @loading="handleLoading" />

    <v-card :loading="fetching">
      <v-card-title primary-title>
        <v-row>
          <v-col>
            <v-select :items="logs" label="Log" @update:modelValue="fetchLog"></v-select>
          </v-col>

          <v-col>
            <v-text-field label="Filter" v-model="filter"></v-text-field>
          </v-col>

          <v-col cols="1">
            <v-btn @click="fetchLog()" :disabled="!log" icon>
              <i class="fas fa-redo-alt" :class="fetching ? 'fa-spin' : ''"></i>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <div v-if="log == 'serverstatus'" v-html="logContent" class="serverstatus"></div>
        <div class="pre" v-else v-html="filteredLog"></div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import EditFile from "../../components/Files/EditFile";

export default {
  components: {
    EditFile,
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
          /^[a-zA-Z]+$/g.test(v) || "Must contain a-z characters only",
        minute: (v) => v == "*" || (v >= 0 && v < 60) || "0-59 or *",
        hour: (v) => v == "*" || (v >= 0 && v < 24) || "0-23 or *",
        dom: (v) => v == "*" || (v >= 1 && v <= 31) || "1-31 or *",
        mon: (v) => v == "*" || (v >= 1 && v < 12) || "1-12 or *",
        dow: (v) => v == "*" || (v >= 1 && v < 7) || "1-7 or *",
      },
      details: "",
      fetching: true,
      userDrawer: false,
      cronjobDrawer: false,
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
          value: "mail",
          title: "Mail",
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

      var lines = this.logContent.split("\n");
      return lines.filter((line) => line.toLowerCase().
        includes(this.filter.toLowerCase())).
        join("\n").
        replace(pathRegex, '<a href="' + location.pathname + '#$1">$1</a>').
        replace(/( on line )([0-9]+)/g, ':$2').
        replace(/(PHP Fatal error)/g, '<span class="error">$1</span>').
        replace(/(PHP Parse error)/g, '<span class="error">$1</span>').
        replace(/(PHP Warning)/g, '<span class="warning">$1</span>')
        ;
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
    fetchLog(log) {
      var self = this;

      this.fetching = true;

      if (log) {
        self.log = log;
      } else if (!self.log) {
        return;
      }

      this.logContent = "loading..";

      api
        .post("servers/" + this.serverId + "/fetchlog", { log: self.log })
        .then(function (response) {
          console.log(response);
          self.logContent = response.data.content;
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
</style>
