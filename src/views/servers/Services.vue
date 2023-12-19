<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-card class="pa-3" :loading="fetching">
      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :value="item">
            <v-switch v-model="item.active" :label="item.name" @change="toggle(item)" color="primary"
              hide-details :loading="loading === item.name"></v-switch>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  data() {
    return {
      error: "",
      items: {},
      fetching: false,
      loading: null,
      serverId: 0,
    }
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/services")
        .then(response => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.items = response.data.services;
          self.data = response.data.item;
          document.title = "Services | " + self.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false)
    },
    toggle(item) {
      var self = this;
      this.loading = item.name;
      this.error = "";
      var action = item.active ? "start" : "stop";

      api
        .post("servers/" + this.serverId + "/services", {
          name: item.name,
          action: action,
        })
        .then(response => {
          console.log(response);

          if (!response.data.success)
            self.error = response.data.error;
          else
            self.fetchData();
        })
        .catch(error => console.log(error))
        .finally(() => self.loading = null)
    },
  },
};
</script>
