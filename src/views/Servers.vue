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
        :loading="fetching"
      >
        <v-card-title primary-title>
          <div class="headline">Servers</div>
        </v-card-title>

        <div        
          v-if="items.length"
        >

          <v-card flat>
            <v-card-text>
              <v-select
                v-model="provider"
                :items="provider_opts"
                label="Provider"
              ></v-select>
            </v-card-text>
          </v-card>
          
          <v-data-table
            :headers="headers"
            :items="filtered"
            class="results"
          >
            <template v-slot:body="prop">
              <tbody>
                <tr v-for="item in prop.items" :key="item.id">
                  <td class="text-start">
                    <v-list-item>
                        <v-icon class="mr-3">fas fa-server</v-icon>

                        <router-link :to="'/servers/' + item.id + '/summary'"> 
                          <v-list-item-title v-html="item.name"></v-list-item-title>
                          <v-list-item-subtitle v-html="item.hostname"></v-list-item-subtitle>
                        </router-link>
                    </v-list-item>
                  </td>
                  <td class="text-start">
                    {{item.provider}}
                  </td>
                  <td class="text-start">
                    {{item.region}}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
          
        </div>

        <v-list v-else>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <router-link to="/servers/create">
                    Add a server
                </router-link>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

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
        loading: false,
        fetching: false,
        error: null,
        filtered: [],
        items: [],
        page: 1,
        pages: 1,
        provider: '*',
        provider_opts: [{
          text: 'All',
          value: '*'
        }, {
          text: 'Linode',
          value: 'linode'
        }, {
          text: 'Digital Ocean',
          value: 'digitalocean'
        }, {
          text: 'Other',
          value: ''
        }],
        headers: [
          {
            text: 'Server ',
            value: 'server'
          },
          {
            text: 'Provider ',
            value: 'provider'
          },
          {
            text: 'Region ',
            value: 'region'
          }
        ]
      }
    },
    created () {
      document.title = 'Servers'
      this.fetchData()
    },
    watch: {
      'provider': function() {
        this.filtered = []
        
        this.items.forEach(element => {
            if (this.provider === '*' || element.provider == this.provider) {
              this.filtered.push(element)
              localStorage.provider = element.provider
            }
        })
      }
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('servers/')
        .then(function (response) {
          console.log(response)
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
        })
      }
    }
  }
</script>

<style>
  .results a {
    color: inherit;
  }
</style>