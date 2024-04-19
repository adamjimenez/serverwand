<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card>
      <v-card-title>Domain details</v-card-title>

      <v-card-text>
        <v-form v-if="!loading" ref="form" v-model="valid" lazy-validation>
          <v-text-field
            :disabled="domainId > 0"
            v-model="data.domain"
            :rules="domainRules"
            label="Domain"
            required
            autofocus
          ></v-text-field>

          <v-btn
            :disabled="domainId > 0 || !data.domain"
            :loading="loading"
            color="success"
            @click="validate"
          >
            Save
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <Domain ref="Domain" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Domain from "../../components/Domain";

export default {
  components: {
    Loading,
    Domain,
  },
  data: () => ({
    loading: false,
    valid: true,
    data: {
      domain: "",
      dns: true,
    },
    domainRules: [(v) => !!v || "Domain is required"],
    passwordRules: [],
    servers: [],
    dnsProviders: {},
    details: "",
    error: "",
    authRequired: false,
  }),

  created() {
    document.title = "Domain details";
    this.domainId = parseInt(this.$route.params.id);
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.error = "";
      this.loading = false;

      api
        .get("domains/" + this.domainId)
        .then(response => {
            console.log(response);

            if (this.domainId)
            this.data=response.data.item;
          })
        .catch(error => console.log(error))
        .finally(() => this.loading = false);
    },
    save() {
      this.error = "";
      this.details = "";
      this.loading = true;

      console.log(arguments);

      if (this.domainId) {
        api
          .post("domains/" + this.domainId + "/update", this.data)
          .then(response => {
              console.log(response);
              this.$router.push("/domains/" + this.domainId + "/summary");
            })
          .catch(error => console.log(error));
      } else {
        this.loading = false;
        this.$refs.Domain.create(this.data);
      }
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.save();
      }
    },
  },
};
</script>