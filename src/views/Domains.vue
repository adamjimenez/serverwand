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

        <Loading :value="loading" />

        <v-list two-line v-if="items.length">
          <template v-for="(item, index) in items">
            <v-list-tile
              v-if="index >= (page-1)*items_per_page && index < page*items_per_page"
              :key="item.name"
              @click="goto(item.id)"
            >
              <v-list-tile-avatar>
                <v-icon>fas fa-globe</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title v-html="item.domain"></v-list-tile-title>
                <v-list-tile-sub-title>{{servers[item.server]}}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>

        <v-list v-else>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                <router-link to="/domains/create">
                    Add a domain
                </router-link>
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <div 
          v-if="items.length > items_per_page"
          class="text-xs-center"
        >
          <v-pagination
            v-model="page"
            :length="items.length / items_per_page"
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
        error: null,
        items: [],
        servers: {},
        page: 1,
        items_per_page: 10
      }
    },
    created () {
      document.title = 'Domains'
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
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
 
          api.get('servers/')
          .then(function (response) {
            response.data.items.forEach(element => {
                self.$set(self.servers, element.id, element.name)
            })
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },      
      goto(to) {
        this.$router.push('/domains/' + to + '/summary')
      }
    }
  }
</script>