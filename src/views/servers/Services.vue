<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="fixProblems()" icon="mdi:mdi-auto-fix" title="Find and fix problems"></v-btn>
      </v-card-actions>

      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :value="item">
            <v-switch v-model="item.active" :label="item.name" @change="toggle(item)" color="primary"
              hide-details :loading="loading === item.name"></v-switch>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="dialog" width="300">
      <v-card color="primary">
        <v-card-text>
          <v-alert title="Spellcasting..." color="primary">
            <template v-slot:prepend>
              <v-icon :icon="closable ? 'fas fa-magic fa-2x faa-horizontal' : 'fas fa-magic fa-2x faa-horizontal animated'"></v-icon>
            </template>
          </v-alert>

          <v-progress-linear :indeterminate="progress == 0" v-model="progress" color="white" v-if="!closable"></v-progress-linear>

          <v-textarea v-model="details" readonly></v-textarea>
        </v-card-text>
          
        <v-card-actions>
          <v-btn @click="dialog = false" :disabled="!closable">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      dialog: false,
      closable: false,
      progress: 0,
      details: "",
    }
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fixProblems() {
      this.dialog = true
      this.closable = false;
      this.details = ''

      // subscribe to status changes
      let url = 'servers/' + this.serverId + '/check'

      api.event(
        url,
        result => {
          this.details += result.msg + "\n";

          if (result.progress) {
            this.progress = result.progress;
          }
        },
        error => {
          this.error = error;
        },
        () => {
          this.closable = true;
        }
      );
    },
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/services")
        .then(response => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.items = response.data.services;
          this.data = response.data.item;
          document.title = "Services | " + this.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false)
    },
    async toggle(item) {
      this.loading = item.name;
      this.error = "";

      let response = await api
        .post("servers/" + this.serverId + "/services", {
          name: item.name,
          start: item.active,
        })
        
      await this.fetchData();          

      if (!response.data.success) {
        this.error = response.data.error;
      }

      this.loading = null
    },
  },
};
</script>
