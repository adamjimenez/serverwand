<template>
  <v-layout row><v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <Loading :value="loading" />

        <v-card flat :loading="fetching">
          <v-data-table :headers="headers" :items="filtered">
            <template v-slot:item.domain="{ item }">
              <v-list-item :to="'/domains/' + item.id + '/summary'" :title="item.domain" class="px-0">
                <template v-slot:prepend v-if="!display.mobile">
                  <v-icon>fas fa-globe</v-icon>
                </template>
              </v-list-item>
            </template>
            <template v-slot:item.registrar="{ item }">
              {{ item.registrar ? registrars[item.registrar].label : "" }}
            </template>
            <template v-slot:item.auto_renew="{ item }">
              {{ item.auto_renew ? "Yes" : "" }}
            </template>
          </v-data-table>
        </v-card>
      </v-col></v-row>
  </v-layout>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading,
  },
  data() {
    return {
      fetching: false,
      loading: false,
      error: "",
      filtered: [],
      registrars: [],
      items: [],
      searchPanel: [false],
      search: "",
      selected: [],
			display: {},
    };
  },
  created() {
		this.display = this.$vuetify.display;

    document.title = "Domains";
    this.fetchData();
  },
  computed: {
    headers: function () {
      var items = [{
        title: "Domain ",
        key: "domain",
      }];

      if (!this.display.mobile) {
        items.push({
          title: "Registrar ",
          key: "registrar",
        }, {
          title: "Auto renew ",
          key: "auto_renew",
        });
      };

      return items;
    }
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("domains/")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.items = response.data.items;

          response.data.provider_tokens.forEach((element) => {
            this.registrars[element.id] = element;
          });

          response.data.items.forEach((element) => {
            this.filtered.push(element);
          });
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>