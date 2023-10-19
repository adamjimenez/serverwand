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
            <v-btn icon :disabled="fetching" :loading="fetching" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="Note">
        <v-card-text>
          <v-textarea v-model="data.note" label="Note"></v-textarea>
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
      loading: false,
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
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("users/" + this.id + "/notes")
        .then(response => {
          console.log(response);
          self.notes = response.data.notes;
          document.title = 'Notes';
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
    addItem() {
      this.domain.name = "";
      this.drawer = true;
    },
    saveItem() {
      var self = this;

      if (this.data.note) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/notes", this.data)
          .then(response => {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.data.note = "";
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(error => {
            console.log(error);
            self.dialog = false;
          })
          .finally(() => self.dialog = false);
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete note")) {
        return;
      }

      var self = this;
      this.error = "";
      this.dialog = true;
      this.loading = true;

      api
        .post("users/" + this.id + "/notes", { delete: 1, note: item.id })
        .then(response => {
          console.log(response);

          if (response.data.error)
            self.error = response.data.error;
          else
            self.fetchData();
        })
        .catch(error => console.log(error))
        .finally(() => {
          self.dialog = false;
          self.loading = false;
        });
    },
  },
};
</script>