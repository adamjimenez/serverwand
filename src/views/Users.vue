<template>
  <v-layout row>
    <v-flex>

      <v-alert
        v-if="error"
        type="error"
      >
        {{error}}
      </v-alert>

      <Loading :value="loading" />

      <v-card 
        flat
        :loading="fetching"
      >
        <v-card-title primary-title>
          <div class="headline">Users</div>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="filtered"
          class="results"
        >
          <template v-slot:body="prop">
            <tr v-for="item in prop.items" :key="item.id">
              <td class="text-start">
                <v-list-item>
                    <v-icon class="mr-3">fas fa-user</v-icon>

                    <router-link :to="'/users/' + item.id + '/summary'"> 
                      <v-list-item-title v-html="item.name"></v-list-item-title>
                    </router-link>
                </v-list-item>
              </td>
            </tr>
          </template>
        </v-data-table>
        
      </v-card>
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
        fetching: false,
        loading: false,
        error: '',
        filtered: [],
        items: [],
        servers: {},
        server: '*',
        searchPanel: [false],
        search: '',
        selected: [],
        headers: [{
          text: 'Name ',
          value: 'name'
        }]
      }
    },
    created () {
      document.title = 'Users'
      this.fetchData()
    },
    methods: {
      fetchData () {        
        var self = this;
        this.error = ''
        this.fetching = true
 
        api.get('users/')
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
            return false
          }
            
          self.items = response.data.items
          
          response.data.items.forEach(element => {
              self.filtered.push(element)
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false

          if (localStorage.server)
            self.server = localStorage.server
        })
      }
    }
  }
</script>

<style>
  .results a {
    color: inherit !important;
  }
  .results .v-list__tile__sub-title {
    opacity: 0.7;
  }
</style>