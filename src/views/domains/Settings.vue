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
    this.id = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("domains/" + this.id)
        .then(function (response) {
          console.log(response);
          self.data = response.data.item;
          document.title = "Settings" + " | " + self.data.domain;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    editItem() {
      this.$router.push("/domains/" + this.$route.params.id + "/edit");
    },
    deleteItem: async function () {
      if (!await this.$refs.confirm.open("Delete " + this.data.domain)) {
        return;
      }

      var self = this;
      this.dialog = true;
      this.loading = true;

      api
        .post("domains/" + this.id, { delete: 1 })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else {
            self.$router.push("/domains/");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.dialog = false;
          self.loading = false;
        });
    },
  },
};
</script>
