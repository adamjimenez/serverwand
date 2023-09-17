<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching" title="Teams">
      <v-data-table :headers="headers" :items="items">
        <template v-slot:item.name="{ item }">
          <v-list-item :to="'/teams/' + item.raw.id + '/members'" :title="item.raw.name" class="px-0">
            <v-list-item-subtitle>
              {{ item.raw.members }} member{{ item.raw.members != 1 ? "s" : "" }},
              {{ item.raw.servers }} server{{ item.raw.servers != 1 ? "s" : "" }}
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
      headers: [
        {
          title: "Name ",
          key: "name",
        },
      ],
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
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("teams/")
        .then(response => {
          console.log(response);
          self.items = response.data.items;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
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