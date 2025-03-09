<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list>
        <v-list-item v-for="(item, i) in notes" :key="`item-${i}`" :title="item.note" :subtitle="item.created">
          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.id" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Note">
        <v-card-text>
          <v-textarea v-model="data.note" label="Note" autofocus></v-textarea>
          <v-btn :disabled="!data.note" :loading="loading" color="success" @click="saveItem">
            Save
          </v-btn>
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
      data: {},
      notes: [],
      dialog: false,
      details: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      domain: {
        name: "",
      },
      drawer: false,
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
        .get("users/" + this.id + "/notes")
        .then(response => {
          console.log(response);
          this.notes = response.data.notes;
          document.title = 'Notes';
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
    addItem() {
      this.domain.name = "";
      this.drawer = true;
    },
    saveItem() {
      if (this.data.note) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/notes", this.data)
          .then(response => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
            } else {
              this.data.note = "";
              this.drawer = false;
              this.fetchData();
            }
          })
          .catch(error => {
            console.log(error);
            this.dialog = false;
          })
          .finally(() => this.dialog = false);
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete note")) {
        return;
      }

      this.error = "";
      this.dialog = true;
      this.loading = item.id;

      api
        .post("users/" + this.id + "/notes", { delete: 1, note: item.id })
        .then(response => {
          console.log(response);

          if (response.data.error)
          this.error = response.data.error;
          else
          this.fetchData();
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.dialog = false;
          this.loading = null;
        });
    },
  },
};
</script>