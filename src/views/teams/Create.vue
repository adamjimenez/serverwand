<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card v-if="!serverId" title="Team details">
      <v-card-text>
        <v-form v-if="!loading" v-model="valid" lazy-validation>
          <v-text-field v-model="data.name" :rules="nameRules" label="Name" required autofocus></v-text-field>

          <v-btn :disabled="!valid" :loading="loading" color="success" @click="validate">
            Save
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";

export default {
  components: {
    Loading,
  },
  data: () => ({
    loading: false,
    valid: true,
    data: {
      name: "",
    },
    nameRules: [(v) => !!v || "Name is required"],
    details: "",
    serverId: 0,
    error: "",
  }),

  created() {
    document.title = "Team details";
    this.id = this.$route.params.id;
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.error = "";
      this.loading = true;

      api
        .get("teams/" + this.id)
        .then((response) => {
          console.log(response);

          if (this.id) {
            this.data.name = response.data.item.name;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validate() {
      this.details = "";
      this.loading = true;

      api
        .post("teams/" + this.id, this.data)
        .then((response) => {
          console.log(response);
          if (response.data.id) {
            this.$router.push("/teams/" + response.data.id + "/members");
          } else if (response.data.error) {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>