<template>
  <v-layout row>
    <v-flex>
      <v-alert
        v-if="error"
        type="error"
      >
        {{error}}
      </v-alert>

      <Loading :value="fetching" />

      <v-list two-line v-if="!fetching">
        <v-list-item>
          <v-list-item-avatar>
            <v-icon left>fas fa-users</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ data.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-tabs>
          <v-tab :to="'/teams/' + id + '/members'">Members</v-tab>
          <v-tab :to="'/teams/' + id + '/servers'">Servers</v-tab>
          <v-tab :to="'/teams/' + id + '/settings'">Settings</v-tab>
      </v-tabs>
      <router-view></router-view>

    </v-flex>

  </v-layout>  
</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        loading: '',
        id: null,
        error: null,
        data: {},
        details: '',
        fetching: false,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        member: {
          email: ''
        },
        memberDrawer: false
      }
    },
    created () {
      document.title = 'Team'
      this.id = this.$route.params.id
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        // this.fetching = true
 
        api.get('teams/' + this.id)
        .then(function (response) {
          console.log(response)            
          self.data = response.data.item
          document.title = self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      }
    }
  }
</script>