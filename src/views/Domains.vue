<template>
  <v-layout row><v-row>
      <v-col cols="12">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <Loading :value="loading" />

        <v-card flat :loading="fetching" title="Domains">
          <v-data-table :headers="headers" :items="filtered">
            <template v-slot:item.domain="{ item }">
              <v-list-item :to="'/domains/' + item.raw.id + '/summary'" :title="item.raw.domain" class="px-0">
                <template v-slot:prepend v-if="!mobile">
                  <v-icon>fas fa-globe</v-icon>
                </template>
              </v-list-item>
            </template>
            <template v-slot:item.registrar="{ item }">
              {{ item.raw.registrar ? registrars[item.raw.registrar].label : "" }}
            </template>
            <template v-slot:item.auto_renew="{ item }">
              {{ item.raw.auto_renew ? "Yes" : "" }}
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
    };
  },
  created() {
    document.title = "Domains";
    this.fetchData();
  },
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    },
    headers: function () {
      var items =  [
        {
          title: "Domain ",
          key: "domain",
        }];

      if (!this.mobile) {
        items.push(
        {
          title: "Registrar ",
          key: "registrar",
        },
        {
          title: "Auto renew ",
          key: "auto_renew",
        });
      };

      return items;
    }
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("domains/")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.items = response.data.items;

          response.data.provider_tokens.forEach((element) => {
            self.registrars[element.id] = element;
          });

          response.data.items.forEach((element) => {
            self.filtered.push(element);
          });
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
  },
};
</script>