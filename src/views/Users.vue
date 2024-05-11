<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-data-table :headers="headers" :items="filtered">
        <template v-slot:item.name="{ item }">
          <v-list-item :to="'/users/' + item.id + '/summary'" :title="item.name" class="px-0">
            <template v-slot:prepend v-if="!display.mobile">
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
      headers: [{
        title: "Name ",
        key: "name",
      }],
			display: {},
    };
  },
  created() {
		this.display = this.$vuetify.display;

    document.title = "Users";
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("users/")
        .then(response => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.items = response.data.items;

          response.data.items.forEach((element) => {
            this.filtered.push(element);
          });
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.fetching = false;

          if (localStorage.server) this.server = localStorage.server;
        });
    },
  },
};
</script>