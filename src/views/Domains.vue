<template>
  <v-layout row>
    <v-flex>

      <v-alert
        :value="error.length>0"
        type="error"
      >
        {{error}}
      </v-alert> 

      <v-card>
        <v-card-title primary-title>
          <div class="headline">Domains</div>
        </v-card-title>

        <v-card tile flat>
          <v-card-text>
            <v-select
              v-model="server"
              :items="server_opts"
              label="Server"
            ></v-select>
          </v-card-text>
        </v-card>

        <Loading :value="loading" />

        <v-data-table
          :headers="headers"
          :items="filtered"
          hide-actions
          :pagination.sync="pagination"
          class="results"
        >
          <template v-slot:items="filtered">
            <td>
              <v-list-tile>
                  <v-list-tile-avatar>
                    <v-icon>fas fa-globe</v-icon>
                  </v-list-tile-avatar>

                  <router-link :to="'/domains/' + filtered.item.id + '/summary'"> 
                    <v-list-tile-title v-html="filtered.item.domain"></v-list-tile-title>
                    <v-list-tile-sub-title>{{servers[filtered.item.server]}}</v-list-tile-sub-title>
                  </router-link>
              </v-list-tile>
            </td>
            <td>
              {{filtered.item.ip}}
            </td>
            <td>
              {{filtered.item.mx}}
            </td>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2">
          <v-pagination 
            v-model="pagination.page" 
            :length="pages"
          ></v-pagination>
        </div>
        
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
        loading: true,
        error: '',
        filtered: [],
        items: [],
        servers: {},
        page: 1,
        pages: 1,
        items_per_page: 10,
        server: null,
        server_opts: [],
        searchPanel: [false],

        search: '',
        pagination: {
          rowsPerPage: 10
        },
        selected: [],
        headers: [
          {
            text: 'Domain ',
            value: 'domain'
          },
          {
            text: 'IP ',
            value: 'ip'
          },
          {
            text: 'MX ',
            value: 'mx'
          }
        ]
      }
    },
    created () {
      document.title = 'Domains'
      this.fetchData()
    },
    watch: {
      'server': function() {
        this.filtered = []
        
        this.items.forEach(element => {
            if (element.server == this.server) {
              this.filtered.push(element)
            }
        })

        this.pages = this.filtered.length ? Math.ceil(this.filtered.length / this.items_per_page) : 1
      }
    },
    methods: {
      fetchData () {        
        var self = this;
        this.error = ''
 
        api.get('domains/')
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

          self.pages = self.filtered.length ? Math.ceil(self.filtered.length / self.items_per_page) : 1
 
          api.get('servers/')
          .then(function (response) {
            response.data.items.forEach(element => {
                self.$set(self.servers, element.id, element.name)

                self.server_opts.push({
                    text: element.name,
                    value: element.id
                })
            })
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      }
    }
  }
</script>

<style>
.results a {
  color: inherit !important;
}
</style>