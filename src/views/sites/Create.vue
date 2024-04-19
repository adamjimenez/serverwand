<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card v-if="!serverId" title="Site details">
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
            :disabled="!valid"
            :loading="loading"
            color="success"
            @click="save"
          >
            Save
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <Site ref="Site" 
      @error="err => error = err"
    />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Site from "../../components/Site";

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
      this.error = "";
      this.loading = false;

      api
        .get("sites/" + this.domainId)
        .then((response) => {
          console.log(response);

          if (this.domainId) {
            this.data = response.data.items[0];
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });

      api
        .get("servers/")
        .then((response) => {
          console.log(response);

          response.data.items.forEach((element) => {
            this.servers.push({
              title: element.name,
              value: element.id,
            });

            this.dnsProviders[element.id] = element.dns;
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    save() {
      this.error = "";
      this.details = "";
      this.loading = true;

      if (this.data.dns) {
        localStorage.dns = "1";
      } else {
        delete localStorage.dns;
      }

      console.log(arguments);

      if (this.domainId) {
        api
          .post("sites/" + this.domainId + "/update", this.data)
          .then((response) => {
            console.log(response);

            if (response.data.error) {
              this.error = response.data.error
              return false
            }

            this.$router.push("/sites/" + this.domainId + "/summary");
          })
          .catch((error) => {
            console.log(error);
            self.error = error;
          });
      } else {
        this.loading = false;
        this.$refs.Site.create(this.data);
      }
    },
  },

};
</script>