<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-data-table :headers="headers" :items="items">
        <template v-slot:item.name="{ item }">
          <v-list-item :to="'/teams/' + item.id + '/members'" :title="item.name" class="px-0">
            <v-list-item-subtitle>
              {{ item.members.length }} member{{ item.members.length != 1 ? "s" : "" }},
              {{ item.servers.length }} server{{ item.servers.length != 1 ? "s" : "" }}
            </v-list-item-subtitle>
            <template v-slot:prepend v-if="!mobile">
              <v-icon>fas fa-users</v-icon>
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
    Loading,
  },
  data() {
    return {
      fetching: false,
      loading: false,
      error: null,
      items: [],
      headers: [{
        title: "Name",
        key: "name",
      }],
    };
  },
  created() {
    document.title = "Teams";
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("teams/")
        .then(response => {
          console.log(response);
          this.items = response.data.items;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
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