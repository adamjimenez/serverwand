<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching" title="Users">
      <v-data-table :headers="headers" :items="filtered" class="results" mobile-breakpoint="0">
        <template v-slot:item.name="{ item }">
          <v-list-item :to="'/users/' + item.raw.id + '/summary'" :title="item.raw.name" class="px-0">
            <template v-slot:prepend v-if="!mobile">
              <v-icon>fas fa-user</v-icon>
            </template>
          </v-list-item>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading
  },
  data() {
    return {
      fetching: false,
      loading: false,
      error: "",
      filtered: [],
      items: [],
      servers: {},
      server: "*",
      headers: [
        {
          title: "Name ",
          key: "name",
        },
      ],
    };
  },
  created() {
    document.title = "Users";
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("users/")
        .then(response => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.items = response.data.items;

          response.data.items.forEach((element) => {
            self.filtered.push(element);
          });
        })
        .catch(error => console.log(error))
        .finally(() => {
          self.fetching = false;

          if (localStorage.server) self.server = localStorage.server;
        });
    },
  },
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    }
  },
};
</script>