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
      <div>
        <v-card-title primary-title>
          <v-switch
            v-model="data.ssl"
            label="SSL"
            @change="toggleSSL()"
          ></v-switch>
        </v-card-title>
      </div>
    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn
          @click="download()"
        >
          Download site
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
          Delete Domain
        </v-btn>
      </v-card-title>
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
        loading: false,
        domainId: null,
        post: null,
        error: null,
        data: {
          disk_usage: 0,
          server: {},
          app: {}
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
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId + '/settings')
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
      toggleSSL () { 
        var self = this
        this.error = ''
        this.fetching = true
        this.loading = true

        api.post('domains/' + this.$route.params.id  + '/settings', {save: 1, ssl: this.data.ssl})
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
          self.loading = false
        })
      },
      deleteDomain () { 
        this.$confirm('Delete ' + this.data.domain + '?').then(res => {
          if (res) {
            var self = this
            this.error = ''
            this.fetching = true
            this.loading = true

            api.get('domains/' + this.$route.params.id + '/delete')
            .then(function (response) {
              console.log(response)
              
              if (response.data.error) {
                self.error = response.data.error
              } else {
                self.$router.push('/domains/')
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
      download() {
        var self = this
        this.fetching = true
        
        api.get('domains/' + this.domainId + '/download')
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error
          } else {
            window.open(response.data.download_url)
          }
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