<template>
  <v-layout row>
    <v-flex>
      
      <div v-if="error" class="error">
        {{ error }}
      </div>
    
      <v-card>
        <v-card-title primary-title>
          <div class="headline">Teams</div>
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
                <v-icon>fas fa-users</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title v-html="item.name"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.hostname"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>

        <v-list v-else>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                <router-link to="/teams/create">
                    Add a team
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
        page: 1,
        items_per_page: 10
      }
    },
    created () {
      document.title = 'Teams'
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
 
        api.get('teams/')
        .then(function (response) {
          console.log(response)
          self.items = response.data.items
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      goto(to) {
        this.$router.push('/teams/' + to + '/members')
      }
    }
  }
</script>