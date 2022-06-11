<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card v-if="!serverId">
      <v-card-title>Domain details</v-card-title>

      <v-card-text>
        <v-form v-if="!loading" ref="form" v-model="valid" lazy-validation>
          <v-text-field
            :disabled="domainId > 0"
            v-model="data.domain"
            :rules="domainRules"
            label="Domain"
            required
          ></v-text-field>

          <v-btn
            :disabled="loading"
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
    this.domainId = this.$route.params.id;
    this.fetchData();
  },

  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.loading = false;

      api
        .get("domains/" + this.domainId)
        .then(function (response) {
          console.log(response);

          if (self.domainId) {
            self.data = response.data.item;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },
    save() {
      var self = this;
      this.error = "";
      this.details = "";
      this.loading = true;

      console.log(arguments);

      if (self.domainId) {
        api
          .post("domains/" + this.domainId + "/update", this.data)
          .then(function (response) {
            console.log(response);
            self.$router.push("/domains/" + self.domainId + "/summary");
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        self.loading = false;
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