<template>
  <div>
    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card max-width="600">
        <v-card-text>
          <v-btn @click="editItem" block class="mb-4"> Edit Name </v-btn>

          <v-btn :disabled="dialog" :loading="loading === 'delete'" @click="deleteItem" color="error" block>
            Delete
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Edit Name">
        <v-card-text>
          <v-text-field v-model="data.name" label="Name" required autofocus></v-text-field>

          <v-btn :disabled="fetching" :loading="loading === 'save'" color="success" @click="validate">
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
      loading: null,
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

      api
        .get("teams/" + this.id)
        .then((response) => {
          console.log(response);
          this.data = response.data.item;
          document.title = "Settings" + " | " + this.data.name;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
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
      this.loading = 'delete';

      api
        .post("teams/" + this.id, { delete: 1 })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.$router.push("/teams/");
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
    validate() {
      this.loading = 'save';

      api
        .post("teams/" + this.id, this.data)
        .then((response) => {
          console.log(response);
          this.fetchData();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
          this.drawer = false;
        });
    },
  },
};
</script>
