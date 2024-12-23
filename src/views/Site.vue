<template>
  <div>
    <v-alert v-if="error" type="error">
      <div v-html="error"></div>
    </v-alert>

    <Loading :value="fetching" />

    <v-list-item :title="data.name">
      <template v-slot:prepend>
        <SiteIcon :app="data.app" :to="'http://' + data.domain + (data.app == 'wordpress' ? '/wp-admin' : '')"></SiteIcon>        
      </template>
      <v-list-item-title>
        <a :href="'http://' + data.domain" target="_blank">
          {{ data.domain }}
        </a>
      </v-list-item-title>
      <v-list-item-subtitle>
        <router-link :to="'/servers/' + data.server.id + '/summary'" class="text-no-wrap">
          {{ data.server.name }}
        </router-link>
      </v-list-item-subtitle>
      <template v-slot:append>
        <v-btn color="success" v-bind:href="data.shiftedit_url" target="_blank" title="Open in ShiftEdit IDE"
          icon="mdi:mdi-code-braces" size="small"></v-btn>
      </template>
    </v-list-item>

    <Tabs>
      <v-tab :to="'/sites/' + domainId + '/summary'">Summary</v-tab>
      <v-tab :to="'/sites/' + domainId + '/app'">App</v-tab>
      <v-tab :to="'/sites/' + domainId + '/aliases'">Aliases</v-tab>
      <v-tab :to="'/sites/' + domainId + '/database'">Database</v-tab>
      <v-tab :to="'/sites/' + domainId + '/variables'">Variables</v-tab>
      <v-tab :to="'/sites/' + domainId + '/email'">Email</v-tab>
      <v-tab :to="'/sites/' + domainId + '/dns'">DNS</v-tab>
      <v-tab :to="'/sites/' + domainId + '/backups'">Backups</v-tab>
      <v-tab :to="'/sites/' + domainId + '/settings'">Settings</v-tab>
    </Tabs>

    <router-view></router-view>

  </div>
</template>

<script>
import api from '../services/api'
import Loading from '../components/Loading'
import SiteIcon from "../components/SiteIcon";
import Tabs from "../components/Tabs";

export default {
  components: {
    Loading,
    SiteIcon,
    Tabs,
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
      this.error = ''
      // this.fetching = true
      this.domainId = this.$route.params.id

      api.get('sites/' + this.domainId)
        .then(response => {
          console.log(response)

          if (response.data.item) {
            this.data = response.data.item
          }
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false)
    }
  }
}
</script>

<style>
.v-list-item a {
  color: inherit !important;
  text-decoration: none;
}

.v-list-item a:hover {
  text-decoration: underline;
}
</style>