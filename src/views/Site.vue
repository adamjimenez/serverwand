<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-container v-if="!fetching" fluid class="py-1">
      <v-row>
        <v-col>
          <v-list-item>
            <template v-slot:prepend>
              <SiteIcon :app="data.app"></SiteIcon>
            </template>

            <v-list-item-title>
              <a :href="'http://' + data.domain" target="_blank">
                {{ data.domain }}
              </a>
            </v-list-item-title>
            <v-list-item-subtitle>
              <router-link :to="'/servers/' + data.server.id + '/summary'">
                {{ data.server.name }}
              </router-link>
            </v-list-item-subtitle>
          </v-list-item>
        </v-col>

        <v-col class="d-flex align-center justify-end">
          <v-btn color="success" v-bind:href="data.shiftedit_url" target="_blank" title="Open in ShiftEdit IDE" icon="mdi:mdi-code-braces" size="small"></v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs show-arrows>
      <v-tab :to="'/sites/' + domainId + '/summary'">Summary</v-tab>
      <v-tab :to="'/sites/' + domainId + '/database'">Database</v-tab>
      <v-tab :to="'/sites/' + domainId + '/variables'">Variables</v-tab>
      <v-tab :to="'/sites/' + domainId + '/aliases'">Aliases</v-tab>
      <v-tab :to="'/sites/' + domainId + '/email'">Email</v-tab>
      <v-tab :to="'/sites/' + domainId + '/apps'">Apps</v-tab>
      <v-tab :to="'/sites/' + domainId + '/dns'">DNS</v-tab>
      <v-tab :to="'/sites/' + domainId + '/backups'">Backups</v-tab>
      <v-tab :to="'/sites/' + domainId + '/settings'">Settings</v-tab>
    </v-tabs>

    <router-view></router-view>

  </div>
</template>

<script>
import api from '../services/api'
import Loading from '../components/Loading'
import SiteIcon from "../components/SiteIcon";

export default {
  components: {
    Loading,
    SiteIcon,
  },
  data() {
    return {
      domainId: null,
      post: null,
      error: null,
      data: {
        server: {}
      },
      details: '',
      fetching: false,
      aliasDrawer: false
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetchData'
  },
  methods: {
    fetchData() {
      var self = this
      this.error = ''
      // this.fetching = true
      this.domainId = this.$route.params.id

      api.get('sites/' + this.domainId)
        .then(response => {
          console.log(response)

          if (response.data.item) {
            self.data = response.data.item
          }
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false)
    }
  }
}
</script>

<style>
.v-list-item a {
  color: inherit !important;
}
.v-list-item a:hover {
  text-decoration: underline;
}
</style>