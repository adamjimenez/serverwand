<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-data-table :headers="headers" :items="invoices" class="results" mobile-breakpoint="0"
        @click:row="function (event, item) { view(item.item) }">

        <template v-slot:item.created="{ item }">
          {{ formatDate(item.created) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon :disabled="fetching" :loading="loading === item.id" @click.stop="deleteItem(item)">
            <v-icon size="small">mdi:mdi-delete</v-icon>
          </v-btn>
        </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="800">
      <v-card title="Invoice">
        <v-card-text>
          <v-form>
            <v-container fluid>
              <v-row v-for="(item, index) in data.items" v-bind:key="index">
                <v-col cols="12" md="3">
                  <v-text-field v-model="item.domain" label="Domain" required></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="item.description" label="Description" required></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field v-model="item.amount" label="Amount" required></v-text-field>
                </v-col>

                <v-col cols="12" md="2">
                  <v-btn @click="removeRow(index)" v-if="index > 0" icon="fas fa-minus"></v-btn>

                  <v-btn @click="addRow()" v-if="index + 1 === data.items.length" icon="fas fa-plus"></v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>

          <div class="mt-5">
            <v-btn :loading="loading" color="success" @click="saveItem">
              Save
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogInvoice" max-width="800">
      <v-card>
        <v-card-title> Invoice {{ invoice_id }} </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <div>
                {{ invoice.company }}<br />
                {{ invoice.name }} {{ invoice.surnname }}<br />
                {{ invoice.address }}<br />
                {{ invoice.city }}<br />
                {{ invoice.postcode }}
              </div>

              <v-row v-for="(item, index) in invoice.items" v-bind:key="index">
                <v-col cols="12" md="3">
                  {{ item.domain }}
                </v-col>

                <v-col cols="12" md="3">
                  {{ item.description }}
                </v-col>

                <v-col cols="12" md="3"> £{{ item.amount }} </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="3"> </v-col>

                <v-col cols="12" md="3"> Total: </v-col>

                <v-col cols="12" md="3"> £{{ invoice.total }} </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Confirm from "../../components/ConfirmDialog.vue";
import util from "../../services/util";

export default {
  components: {
    Loading,
    Confirm
  },
  data() {
    return {
      fetching: false,
      loading: null,
      id: null,
      error: null,
      data: {
        items: [{}],
      },
      invoice: {},
      invoices: [],
      dialog: false,
      dialogInvoice: false,
      invoice_id: null,
      details: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      domain: {
        name: "",
      },
      headers: [{
        title: "Invoice ",
        key: "id",
      }, {
        title: "Date ",
        key: "created",
      }, {
        title: "Total ",
        key: "total",
      }, {
        title: "Status ",
        key: "payment_status",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: " ",
        key: "actions",
      }],
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.id = this.$route.params.id;
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      this.error = "";
      this.id = this.$route.params.id;
      this.fetching = true;

      api
        .get("users/" + this.id + "/invoices")
        .then((response) => {
          console.log(response);
          this.invoices = response.data.invoices;
          document.title = 'Invoices'
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.domain.name = "";
      this.dialog = true;
    },
    saveItem() {
      if (this.data.items.length) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/invoices", this.data)
          .then((response) => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
            } else {
              this.data.invoice = "";
              this.dialog = false;
              this.fetchData();
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.id)) {
        return;
      }

      this.error = "";
      this.dialog = true;
      this.loading = item.id;

      api
        .post("users/" + this.id + "/invoices", { delete: 1, invoice: item.id })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.dialog = false;
          this.loading = null;
        });
    },
    addRow() {
      this.data.items.push({});
    },
    removeRow(index) {
      this.data.items.splice(index, 1);
    },
    view(item) {
      this.invoice_id = item.id;
      this.fetching = true;

      api
        .get("users/" + this.id + "/invoices/" + this.invoice_id)
        .then((response) => {
          this.invoice = response.data.invoice;
          this.dialogInvoice = true;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    formatDate(value) {
      return util.formatDate(value);
    },
  },
};
</script>