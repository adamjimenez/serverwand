<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <Loading :value="loading" />

    <v-card
      class="pa-3"
      :loading="fetching"
    >
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in items">

            <v-list-item
              :key="`item-${i}`"
              :value="item"
            >
              <template>
                <v-list-item-content>
                  <v-list-item-title>
                      <v-switch
                          v-model=item.active
                          :label=item.name
                          @change="toggle(item)"
                      ></v-switch>
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-list-item>

          </template>
        </v-list-item-group>
      </v-list>
    </v-card>


  </div>
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        error: '',
        items: {},
        fetching: false,
        loading: false,
        serverId: 0,
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.serverId = this.$route.params.id
      this.fetchData()
    },
    methods: {
      fetchData () {  
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('servers/' + this.serverId + '/services')
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            return false
          }
          
          self.items = response.data.services
          self.data = response.data.item
          document.title = 'Services' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      }, 
      toggle(item) {
        var self = this
        this.loading = true
        this.error = ''
        var action = item.active ? 'start' : 'stop';

        api.post('servers/' + this.serverId + '/services', {name: item.name, action: action})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
    }
  }
</script>
