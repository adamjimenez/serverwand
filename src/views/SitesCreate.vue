<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card v-if="!serverId">
      <v-card-title>Site details</v-card-title>

      <v-card-text>
        <v-form v-if="!loading" ref="form" v-model="valid" lazy-validation>
          <v-text-field
            :disabled="domainId > 0"
            v-model="data.domain"
            :rules="domainRules"
            label="Domain"
            required
          ></v-text-field>

          <v-select
            :disabled="domainId > 0"
            v-model="data.server"
            :items="servers"
            label="Server"
            :rules="[(v) => !!v || 'Server is required']"
            required
          ></v-select>

          <v-checkbox
            v-model="data.dns"
            label="Configure DNS"
            :disabled="!data.server || dnsProviders[data.server] == ''"
          ></v-checkbox>

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

    <Site ref="Site" />
  </div>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";
import Site from "../components/Site";

export default {
  components: {
    Loading,
    Site,
  },
  data: () => ({
    loading: false,
    valid: true,
    data: {
      domain: "",
      password: "",
      server: "",
      dns: false,
    },
    domainRules: [(v) => !!v || "Domain is required"],
    passwordRules: [],
    servers: [],
    dnsProviders: {},
    details: "",
    serverId: 0,
    error: "",
    authRequired: false,
  }),

  created() {
    document.title = "Site details";
    this.domainId = this.$route.params.id;
    this.fetchData();

    if (localStorage.dns) {
      this.data.dns = true;
    }
  },

  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.loading = false;

      api
        .get("sites/" + this.domainId)
        .then(function (response) {
          console.log(response);

          if (self.domainId) {
            self.data = response.data.items[0];
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });

      api
        .get("servers/")
        .then(function (response) {
          console.log(response);

          response.data.items.forEach((element) => {
            self.servers.push({
              text: element.name,
              value: element.id,
            });

            self.dnsProviders[element.id] = element.dns;
          });
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

      if (this.data.dns) {
        localStorage.dns = "1";
      } else {
        delete localStorage.dns;
      }

      console.log(arguments);

      if (self.domainId) {
        api
          .post("sites/" + this.domainId + "/update", this.data)
          .then(function (response) {
            console.log(response);
            self.$router.push("/sites/" + self.domainId + "/summary");
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        self.loading = false;
        this.$refs.Site.create(this.data);
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