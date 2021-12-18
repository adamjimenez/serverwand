<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-data-table
        v-if="items.length"
        :headers="headers"
        :items="items"
        class="results"
      >
        <template v-slot:body="prop">
          <tbody>
            <tr v-for="item in prop.items" :key="item.id">
              <td class="text-start">
                <v-list-item>
                  <v-checkbox v-model="item.selected"></v-checkbox>
                </v-list-item>
              </td>
              <td class="text-start">
                <v-switch
                  v-model="item.online"
                  label="Online"
                  @change="toggle(item)"
                ></v-switch>
              </td>
              <td class="text-start" @click="view(item)">
                {{ item.pid }}
              </td>
              <td class="text-start">
                {{ item.name }}
              </td>
              <td class="text-start">
                {{ item.status }}
              </td>
              <td class="text-start">
                {{ item.port }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>

      <v-card-text v-else> No apps </v-card-text>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="deleteApps()" :disabled="!selected"> Delete </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-dialog app v-model="dialog">
      <v-card>
        <v-card-title> Output Log: </v-card-title>

        <v-card-text>
          <v-textarea readonly :value="output_log" auto-grow></v-textarea>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-title> Error Log: </v-card-title>

        <v-card-text>
          <v-textarea readonly :value="error_log" auto-grow></v-textarea>
        </v-card-text>
      </v-card>
    </v-dialog>
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
      items: [],
      data: {},
      loading: false,
      fetching: false,
      dialog: false,
      serverId: 0,
      selected: false,
      headers: [
        {
          text: "",
          value: "",
        },
        {
          text: "",
          value: "",
        },
        {
          text: "PID",
          value: "id",
        },
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Status",
          value: "status",
        },
        {
          text: "Ports",
          value: "port",
        },
      ],
      error_log: "",
      output_log: "",
    };
  },
  watch: {
    items: {
      handler: function (newItems) {
        for (var i = 0; i < newItems.length; i++) {
          if (newItems[i].selected) {
            this.selected = true;
            return;
          }
        }

        this.selected = false;
      },
      deep: true,
    },
  },
  created() {
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/apps")
        .then(function (response) {
          console.log(response);
          self.data = response.data.item;
          self.items = response.data.apps;

          document.title = "Apps | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    toggle(item) {
      var self = this;
      this.loading = true;
      this.error = "";
      var action = item.active ? "start" : "stop";

      api
        .post("servers/" + this.serverId + "/apps", {
          name: item.name,
          action: action,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },
    deleteApps() {
      var self = this;
      self.fetching = true;

      var ids = [];
      this.items.forEach((element) => {
        if (element.selected) {
          ids.push(element.id);
        }
      });

      api
        .post("servers/" + this.serverId + "/apps", { ids: ids })
        .then(function () {
          self.fetchData();
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    view(item) {
      this.dialog = true;
      this.output_log = item.output_log;
      this.error_log = item.error_log;
    },
  },
};
</script>
