<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card v-if="!serverId" title="User details">

      <v-card-text>
        <v-form v-if="!loading" v-model="valid" lazy-validation>
          <v-text-field v-model="data.company" label="Company" required autofocus></v-text-field>

          <v-text-field v-model="data.name" :rules="requiredRules" label="Name" required></v-text-field>

          <v-text-field v-model="data.surname" :rules="requiredRules" label="Surname" required></v-text-field>

          <v-text-field v-model="data.email" :rules="emailRules" label="Email" required></v-text-field>

          <v-text-field v-model="data.password" :rules="requiredRules" label="Password" type="password"
            required></v-text-field>

          <v-text-field v-model="data.address" :rules="requiredRules" label="Address" required></v-text-field>

          <v-text-field v-model="data.city" :rules="requiredRules" label="City" required></v-text-field>

          <v-text-field v-model="data.postcode" :rules="requiredRules" label="Postcode" required></v-text-field>

          <v-text-field v-model="data.tel" :rules="requiredRules" label="Telephone" required></v-text-field>

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
    requiredRules: [(v) => !!v || "Required"],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    details: "",
    serverId: 0,
    error: "",
  }),

  created() {
    document.title = "User details";
    this.id = this.$route.params.id;
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.error = "";
      this.loading = true;

      api
        .get("users/" + this.id)
        .then(response => {
          console.log(response);

          if (this.id) {
            this.data = response.data.item;
          }
        })
        .catch(error => {
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
        .post("users/" + this.id, this.data)
        .then(response => {
          console.log(response);
          if (response.data.id) {
            this.$router.push("/users/" + response.data.id + "/summary");
          } else if (response.data.error) {
            this.error = response.data.error;
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>