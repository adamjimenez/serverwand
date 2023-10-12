<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-data-table :headers="headers" :items="data.records" class="results" mobile-breakpoint="0" @click:row="editItem">
      <template v-slot:item.type="{ item }">
        <span>{{ item.type }}</span>
      </template>

      <template v-slot:item.priority="{ item }">
        <span v-if="item.type === 'MX'">{{ item.priority }}</span>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="small" @click.stop="deleteItem(item)">
          mdi:mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <v-card>
      <v-card-actions>
        <v-btn @click="addItem()"> Add DNS Record </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="DNS Record">
        <v-card-text>
          <v-select :items="recordType" label="Type" v-model="record.type"></v-select>

          <v-text-field v-model="record.name" label="Hostname" required></v-text-field>

          <v-text-field v-model="record.target" label="Target" required></v-text-field>

          <v-text-field v-if="record.type === 'MX'" v-model="record.priority" label="Priority" required></v-text-field>

          <v-btn :disabled="!record.name || record.target || record.priority" :loading="fetching" color="success"
            @click="saveItem()">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <Confirm ref="confirm" />
    <OAuth ref="oauth" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Confirm from "../../components/ConfirmDialog.vue";
import OAuth from "../../components/OAuth.vue";

export default {
  components: {
    Loading,
    Confirm,
    OAuth,
  },
  data() {
    return {
      domainId: null,
      post: null,
      error: null,
      data: {
        records: [],
      },
      details: "",
      loading: false,
      fetching: false,
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      record: {},
      recordType: ["A", "CNAME", "MX", "TXT", "SRV", "NS"],
      drawer: false,
      headers: [{
        title: "Type ",
        key: "type",
      }, {
        title: "Name ",
        key: "name",
      }, {
        title: "Target ",
        key: "target",
      }, {
        title: "Priority ",
        key: "priority",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "",
        key: "actions",
        sortable: false,
      }],
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.domainId = this.$route.params.id;

      this.fetching = true;

      api
        .get("sites/" + this.domainId + "/records")
        .then(async function (response) {
          console.log(response);

          switch (await self.$refs.oauth.check(response.data)) {
            case true:
              return self.fetchData();
            case false:
              return;
          }

          self.data = response.data;

          //self.data = response.data.item
          document.title = "DNS" + " | " + self.data.domain;

          self.error = response.data.error;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.record = {};
      this.drawer = true;
    },
    saveItem() {
      var self = this;

      if (this.record.type) {
        this.details = "";
        this.fetching = true;
        this.error = "";

        var url = "sites/" + this.domainId + "/records";

        if (this.record.id) {
          url += "/" + this.record.id;
        }

        api
          .post(url, this.record)
          .then(async function (response) {
            console.log(response);

            switch (await self.$refs.oauth.check(response.data)) {
              case true:
                return self.saveItem();
              case false:
                return;
            }

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          })
          .finally(function () {
            self.fetching = false;
          });
      }
    },
    editItem(event, data) {
      this.record = JSON.parse(JSON.stringify(data.item));
      this.drawer = true;
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete record")) {
        return;
      }

      this.fetching = true;
      this.error = "";

      var self = this;
      api
        .post("sites/" + this.domainId + "/records/" + item.id, {
          delete: 1,
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
          self.fetching = false;
        });
    },
  },
};
</script>
