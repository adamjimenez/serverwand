<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-data-table :headers="headers" :items="invoices" class="results">
        <template v-slot:body="prop">
          <tbody>
            <tr v-for="item in prop.items" :key="item.id">
              <td class="text-start" @click="view(item.id)">
                {{ item.id }}
              </td>
              <td class="text-start">
                {{ item.created }}
              </td>
              <td class="text-start">£{{ item.total }}</td>
              <td class="text-start">
                {{ item.status }}
              </td>
              <td class="text-start">
                <v-btn
                  icon
                  :disabled="fetching"
                  :loading="fetching"
                  @click="deleteItem(item.id)"
                >
                  <v-icon small>delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add invoice </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-dialog app v-model="dialog" temporary right>
      <v-card>
        <v-card-title> Invoice </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <v-row v-for="(item, index) in data.items" v-bind:key="index">
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="item.domain"
                    label="Domain"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="item.description"
                    label="Description"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="item.amount"
                    label="Amount"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="3">
                  <v-btn @click="removeRow(index)" v-if="index > 0">
                    <v-icon>fas fa-minus</v-icon>
                  </v-btn>

                  <v-btn
                    @click="addRow()"
                    v-if="index + 1 === data.items.length"
                  >
                    <v-icon>fas fa-plus</v-icon>
                  </v-btn>
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

    <v-dialog app v-model="dialogInvoice" temporary right>
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
      fetching: false,
      loading: false,
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
      headers: [
        {
          text: "Invoice ",
          value: "id",
        },
        {
          text: "Date ",
          value: "created",
        },
        {
          text: "Total ",
          value: "total",
        },
        {
          text: "Status ",
          value: "status",
        },
      ],
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
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("users/" + this.id + "/invoices")
        .then(function (response) {
          console.log(response);
          self.invoices = response.data.invoices;
          document.title = 'Invoices'
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.domain.name = "";
      this.dialog = true;
    },
    saveItem() {
      var self = this;

      if (this.data.items.length) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/invoices", this.data)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.data.invoice = "";
              self.dialog = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    deleteItem(id) {
      this.$confirm("Delete invoice?").then((res) => {
        if (!res) {
          return;
        }

        var self = this;
        this.error = "";
        this.dialog = true;
        this.loading = true;

        api
          .post("users/" + this.id + "/invoices", { delete: 1, domain: id })
          .then(function (response) {
            console.log(response);

            if (response.data.error) {
              self.error = response.data.error;
            } else {
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(function () {
            self.dialog = false;
            self.loading = false;
          });
      });
    },
    addRow() {
      this.data.items.push({});
    },
    removeRow(index) {
      this.data.items.splice(index, 1);
    },
    view(id) {
      this.invoice_id = id;

      var self = this;
      self.fetching = true;
      api
        .get("users/" + this.id + "/invoices/" + this.invoice_id)
        .then(function (response) {
          self.invoice = response.data.invoice;
          self.dialogInvoice = true;
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