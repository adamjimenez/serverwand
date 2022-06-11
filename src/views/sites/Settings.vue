<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>

    <Loading :value="loading" />

    <SSL :siteId="this.siteId" :provider="data.ssl_provider.provider" :fullchain="data.ssl_provider.fullchain"  @closed="fetchData(true)" />

    <v-card>

      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              OpenBasedir
            </v-list-item-title>
            <v-list-item-subtitle>
              <Edit :val="data.openbasedir" label="OpenBasedir" name="openbasedir" :path="'sites/' + this.siteId + '/openbasedir'" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn
          :disabled="fetching"
          :loading="loading=='empty'"
          @click="empty"
          color="error"
        >
          Empty Site
        </v-btn>
      </v-card-title>
    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn
          :disabled="fetching"
          :loading="loading=='delete'"
          @click="deleteDomain"
          color="error"
        >
          Delete Site
        </v-btn>
      </v-card-title>
    </v-card>
  </div>  
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Edit from '../../components/Edit'
  import SSL from '../../components/SSL'

  export default {
    components: {
      Loading,
      Edit,
      SSL
    },
    data () {
      return {
        loading: false,
        siteId: null,
        post: null,
        error: null,
        data: {
          disk_usage: 0,
          server: {},
          app: {},
          ssl_provider: {
            provider: 'none'
          }
        },
        details: '',
        fetching: false,
        copyText: 'Copy'
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
        this.fetching = true
        this.siteId = this.$route.params.id
 
        api.get('sites/' + this.siteId + '/settings')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Settings' + ' | ' + self.data.domain
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      empty () { 
        this.$confirm('Empty ' + this.data.domain + '?').then(res => {
          if (res) {
            var self = this
            this.error = ''
            this.fetching = true
            this.loading = true

            api.get('sites/' + this.$route.params.id + '/empty')
            .then(function (response) {
              console.log(response)
              
              if (response.data.error) {
                self.error = response.data.error
              }
            })
            .catch(function (error) {
              console.log(error)
            })
            .finally(function() {
              self.fetching = false
              self.loading = false
            })
          }
        })
      },
      deleteDomain () { 
        this.$confirm('Delete ' + this.data.domain + '?').then(res => {
          if (res) {
            var self = this
            this.error = ''
            this.fetching = true
            this.loading = true

            api.get('sites/' + this.$route.params.id + '/delete')
            .then(function (response) {
              console.log(response)
              
              if (response.data.error) {
                self.error = response.data.error
              } else {
                self.$router.push('/sites/')
              }
            })
            .catch(function (error) {
              console.log(error)
            })
            .finally(function() {
              self.fetching = false
              self.loading = false
            })
          }
        })
      }
    }
  }
</script>