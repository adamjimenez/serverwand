<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card>
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>
    </v-card>

    <v-data-table :headers="headers" :items="data.records" mobile-breakpoint="0" @click:row="editItem" hover>
      <template v-slot:item.type="{ item }">
        <span>{{ item.type }}</span>
      </template>

      <template v-slot:item.priority="{ item }">
        <span v-if="item.type === 'MX'">{{ item.priority }}</span>
      </template>

      <template v-slot:item.target="{ item }">
        <p style="max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ item.target }}</p>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn size="small" @click.stop="deleteItem(item)" :loading="loading === item.id" icon="mdi:mdi-delete"></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="drawer" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            DNS Record
          </div>

         <v-btn
           icon="mdi:mdi-close"
           variant="text"
           @click="drawer = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-select :items="recordType" label="Type" v-model="record.type"></v-select>

          <v-text-field v-model="record.name" label="Hostname" required></v-text-field>

          <v-text-field v-model="record.target" label="Target" required></v-text-field>

          <v-text-field v-if="record.type === 'MX'" v-model="record.priority" label="Priority" required></v-text-field>

          <v-btn :disabled="!isValid" :loading="fetching" color="success"
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
      loading: null,
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
        title: "Type",
        key: "type",
      }, {
        title: "Name",
        key: "name",
      }, {
        title: "Target",
        key: "target",
      }, {
        title: "Priority",
        key: "priority",
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
      this.error = "";
      this.domainId = this.$route.params.id;
      this.fetching = true;

      api
        .get("sites/" + this.domainId + "/records")
        .then(async (response) => {
          console.log(response);

          switch (await this.$refs.oauth.check(response.data)) {
            case true:
              return this.fetchData();
            case false:
              return;
          }

          this.data = response.data;

          //this.data = response.data.item
          document.title = "DNS" + " | " + this.data.domain;

          this.error = response.data.error;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.record = {};
      this.drawer = true;
    },
    saveItem() {
      if (this.record.type) {
        return;
      }
      
      this.details = "";
      this.fetching = true;
      this.error = "";

      var url = "sites/" + this.domainId + "/records";

      if (this.record.id) {
        url += "/" + this.record.id;
      }

      api
        .post(url, this.record)
        .then(async (response) => {
          console.log(response);

          switch (await this.$refs.oauth.check(response.data)) {
            case true:
              return this.saveItem();
            case false:
              return;
          }

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.drawer = false;
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
          this.fetching = false;
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    editItem(event, data) {
      this.record = JSON.parse(JSON.stringify(data.item));
      this.drawer = true;
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete record")) {
        return;
      }

      this.loading = item.id;
      this.error = "";

      api
        .post("sites/" + this.domainId + "/records/" + item.id, {
          delete: 1,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
        });
    },
  },
  computed: {
    isValid: function () {
      if (!this.record.type) {
        return false;
      }

      if (!this.record.target) {
        return false;
      }

      if (this.record.type === 'MX' && !this.record.priority) {
        return false;
      }

      return true;
    }
  }
};
</script>
