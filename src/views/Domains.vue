<template>
  <v-layout row>
    <v-flex>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>

      <Loading :value="loading" />

      <v-card flat :loading="fetching">
        <v-card-title primary-title>
          <div class="headline">Domains</div>
        </v-card-title>

        <v-data-table :headers="headers" :items="filtered" class="results" mobile-breakpoint="0">
          <template v-slot:item.domain="{ item }">
            <v-list-item>
              <v-icon class="mr-3">fas fa-globe</v-icon>

              <router-link :to="'/domains/' + item.id + '/summary'">
                <v-list-item-title
                  v-html="item.domain"
                ></v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </router-link>
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
    </v-flex>
  </v-layout>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";

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
      headers: [
        {
          text: "Domain ",
          value: "domain",
        },
        {
          text: "Registrar ",
          value: "registrar",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "Auto renew ",
          value: "auto_renew",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        } /*, {
          text: 'Expiration ',
          value: 'expiration'
        }*/,
      ],
    };
  },
  created() {
    document.title = "Domains";
    this.fetchData();
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

            if(response.data.error) {
              self.error=response.data.error;
              return false;
            }

            self.items=response.data.items;

            response.data.provider_tokens.forEach((element) => {
              self.registrars[element.id]=element;
            });

            response.data.items.forEach((element) => {
              self.filtered.push(element);
            });
          })
        .catch(error => console.log(error))
        .finally(() => self.fetching=false);
    },
  },
};
</script>

<style>
.results a {
  color: inherit !important;
}
.results .v-list__tile__sub-title {
  opacity: 0.7;
}
</style>