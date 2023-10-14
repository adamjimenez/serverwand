<template>
  <div>
    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card max-width="600">
        <v-card-text>
          <v-btn @click="editItem" block class="mb-4"> Edit Name </v-btn>

          <v-btn :disabled="dialog" :loading="dialog" @click="deleteItem" color="error" block>
            Delete
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="Edit Name">
        <v-card-text>
          <v-text-field v-model="data.name" label="Name" required></v-text-field>

          <v-btn :disabled="fetching" :loading="fetching" color="success" @click="validate">
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
      drawer: false,
      fetching: false,
      loading: false,
      error: "",
      data: {
        users: {},
      },
      dialog: false,
      details: "",
      id: 0,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.id = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;
      var self = this;

      api
        .get("teams/" + this.id)
        .then(function (response) {
          console.log(response);
          self.data = response.data.item;
          document.title = "Settings" + " | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    editItem() {
      this.drawer = true;
    },
    deleteItem: async function () {
      if (!await this.$refs.confirm.open("Delete " + this.data.name)) {
        return;
      }

      this.dialog = true;
      this.loading = true;

      api
        .post("teams/" + this.id, { delete: 1 })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.$router.push("/teams/");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          this.dialog = false;
          this.loading = false;
        });
    },
    validate() {
      this.loading = true;

      api
        .post("teams/" + this.id, this.data)
        .then(function (response) {
          console.log(response);
          this.fetchData();
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          this.loading = false;
          this.drawer = false;
        });
    },
  },
};
</script>
