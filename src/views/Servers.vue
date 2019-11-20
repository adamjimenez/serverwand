<template>
  <v-layout row>
    <v-flex>
      
      <div v-if="error" class="error">
        {{ error }}
      </div>
    
      <v-card>
        <v-card-title primary-title>
          <div class="headline">Servers</div>
        </v-card-title>

        <Loading :value="loading" />
        
        <v-list two-line v-if="items.length" class="results">
          <template v-for="(item, index) in items">
            <v-list-item
              v-if="index >= (page-1)*items_per_page && index < page*items_per_page"
              :key="item.name"
            >
              <v-list-item-avatar>
                <v-icon>fas fa-server</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <router-link :to="'/servers/' + item.id + '/summary'"> 
                  <v-list-item-title v-html="item.name"></v-list-item-title>
                  <v-list-item-subtitle v-html="item.hostname"></v-list-item-subtitle>
                </router-link>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>

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

        <div 
          v-if="items.length > items_per_page"
          class="text-xs-center"
        >
          <v-pagination
            v-model="page"
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
        error: null,
        items: [],
        page: 1,
        pages: 1,
        items_per_page: 10
      }
    },
    created () {
      document.title = 'Servers'
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
        this.loading = true
 
        api.get('servers/')
        .then(function (response) {
          console.log(response)
          self.items = response.data.items
          self.pages = self.items.length ? Math.ceil(self.items.length / self.items_per_page) : 1
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
  color: inherit;
}
</style>