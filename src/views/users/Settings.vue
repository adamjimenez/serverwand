<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card>
        <v-card-title primary-title>
          <v-btn @click="editItem"> Edit </v-btn>
        </v-card-title>
      </v-card>

      <v-card>
        <v-card-title primary-title>
          <v-btn :disabled="dialog" :loading="dialog" @click="deleteItem" color="error">
            Delete
          </v-btn>
        </v-card-title>
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
        .get("users/" + this.id)
        .then(response => {
          console.log(response);
          self.data = response.data.item;
          document.title = "Settings" + " | " + self.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
    editItem() {
      this.$router.push("/users/" + this.$route.params.id + "/edit");
    },
    deleteItem: async function() {
      if (
        await this.$refs.confirm.open(
          "Confirm",
          "Delete " + this.data.name
        )
      ) {
        var self = this;
        this.dialog = true;
        this.loading = true;

        api
          .post("users/" + this.id, { delete: 1 })
          .then(response => {
            console.log(response);

            if (response.data.error) {
              self.error = response.data.error;
            } else {
              self.$router.push("/users/");
            }
          })
          .catch(error => console.log(error))
          .finally(() => {
            self.dialog = false;
            self.loading = false;
          });
      }
    },
    
  },
};
</script>
