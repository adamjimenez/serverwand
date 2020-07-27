<template>
  <div>
    <v-alert
        :value="error.length>0"
        type="error"
    >
        {{error}}
    </v-alert>

    <Loading :value="loading" />

    <v-card
        class="pa-3"
        :loading="fetching"
    >
        <v-list v-if="data.items.length>0">
        <v-list-item-group>
            <template v-for="(item, i) in data.items">

            <v-list-item
                :key="`item-${i}`"
                :value="item"
                @click="restore(item.name)"
            >
                <template v-slot:default>
                <v-list-item-content>
                    <v-list-item-title>{{item.name}}</v-list-item-title>
                    <v-list-item-subtitle>{{item.date}} - {{item.size | prettyBytes }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                    <v-btn
                        icon
                        @click="deleteBackup(item.name)"
                        @click.stop
                    >
                    <v-icon small>delete</v-icon>
                    </v-btn>
                </v-list-item-action>

                </template>
            </v-list-item>
            </template>
        </v-list-item-group>
        </v-list>

        <v-card-text v-else>
            Empty
        </v-card-text>

    </v-card>

    <v-card>
        <div>
            <v-card-title primary-title>
              <v-btn
                  @click="createBackup()"
              >
                  Create backup
              </v-btn>
            </v-card-title>
        </div>
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
        domainId: null,
        post: null,
        error: null,
        data: {
            domain: '',
            items: []
        },
        details: '',
        loading: false,
        fetching: false,
        alias: {
          domain: '',
          dns: false
        },
        timer: null
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
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
        this.domainId = this.$route.params.id
        clearTimeout(self.timer)

        this.fetching = true
 
        api.get('domains/' + this.domainId + '/backups')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data
          document.title = 'Backups' + ' | ' + self.data.domain
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      createBackup() {
        var self = this
        this.fetching = true
        
        api.get('domains/' + this.domainId + '/backups/create')
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      deleteBackup(item) {
        this.$confirm('Delete ' + item + '?').then(res => {
          if (!res) {
            return
          }
          
          var self = this
          self.fetching = true

          api.post('domains/' + this.domainId + '/backups', {ids: [item]})
          .then(function () {
              self.fetchData()
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
        })
      },
      restore(item) {
        this.$confirm('Restore ' + item + '?').then(res => {
          if (!res) {
            return
          }
          
          var self = this
          self.fetching = true

          api.post('domains/' + this.domainId + '/backups', {restore: item})
          .then(function () {
              self.fetchData()
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
        })
      }
    }
  }
</script>
