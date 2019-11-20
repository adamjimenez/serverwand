<template>
  <v-layout row>
    <v-flex>

      <v-alert
        :value="error.length>0"
        type="error"
      >
        {{error}}
      </v-alert> 

      <v-card flat>
        <v-card-title primary-title>
          <div class="headline">Domains</div>
        </v-card-title>

        <v-card flat>
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
          class="results"
        >
          <template v-slot:body="prop">
            <tr v-for="item in prop.items" :key="item.id">
              <td class="text-start">
                <v-list-item>
                    <v-icon class="mr-3">fas fa-globe</v-icon>

                    <router-link :to="'/domains/' + item.id + '/summary'"> 
                      <v-list-item-title v-html="item.domain"></v-list-item-title>
                      <v-list-item-subtitle>{{servers[item.server]}}</v-list-item-subtitle>
                    </router-link>
                </v-list-item>
              </td>
              <td class="text-start">
                {{item.ip}}
              </td>
              <td class="text-start">
                {{item.mx}}
              </td>
              <td class="text-start">
                {{format(item.usage)}}
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
        loading: true,
        error: '',
        filtered: [],
        items: [],
        servers: {},
        server: null,
        server_opts: [],
        searchPanel: [false],

        search: '',
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
          },
          {
            text: 'Usage ',
            value: 'usage'
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
      }
    },
    methods: {
      format: function(size) {
        if (size === '' || size === -1) {
          return ''
        }

        var si
        for(si = 0; size >= 1024; size /= 1024, si++) {}

        return '' + Math.round(size) + 'KMGT'.substr(si, 1)
      },
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
.results .v-list__tile__sub-title {
  opacity: 0.7;
}
</style>