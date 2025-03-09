<template>
  <div>
    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card max-width="600">
        <v-card-text>
          <v-btn @click="editItem" block class="mb-4"> Edit </v-btn>
          <v-btn :disabled="dialog" :loading="dialog" @click="deleteItem" color="error" block>
            Delete
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card>
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
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.id = this.$route.params.id;
      this.fetching = true;

      api
        .get("domains/" + this.id)
        .then((response) => {
          console.log(response);
          this.data = response.data.item;
          document.title = "Settings" + " | " + this.data.domain;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    editItem() {
      this.$router.push("/domains/" + this.$route.params.id + "/edit");
    },
    deleteItem: async function () {
      if (!await this.$refs.confirm.open("Delete " + this.data.domain)) {
        return;
      }

      this.dialog = true;
      this.loading = true;

      api
        .post("domains/" + this.id, { delete: 1 })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.$router.push("/domains/");
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.dialog = false;
          this.loading = false;
        });
    },
  },
};
</script>
