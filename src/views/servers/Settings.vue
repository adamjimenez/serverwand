<template>
    <div>
        <Loading :value="fetching" />

        <v-card>
            <v-card-title primary-title>
              <div>
                  <v-btn
                      @click="editServer"
                      >
                      Edit
                  </v-btn>
              </div>
              <div>
                  <v-btn
                      :disabled="dialog"
                      :loading="dialog"
                      @click="deleteServer"
                      >
                      Disconnect
                  </v-btn>
              </div>
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
        error: '',
        data: {
          users: {}
        },
        dialog: false,
        details: '',
        fetching: true,
        serverId: 0
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
 
        api.server(this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            if (response.data.expired) {
              location.href = 'https://serverwand.com/pricing'
            }

            return false
          }
            
          self.data = response.data.items[0]
          self.data.disk_perc = Math.round((1- (self.data.disk_free / self.data.disk_space)) * 100)
          self.data.mem_perc = Math.round((1- (self.data.mem_free / self.data.mem_total)) * 100)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      editServer () { 
        this.$router.push('/servers/' + this.$route.params.id + '/edit')
      },
      deleteServer () {
        var self = this
        this.dialog = true

        api.deleteServer(this.$route.params.id)
        .then(function (response) {
          console.log(response)

          if (response.data.success) {
            // subscribe to status changes
            self.$router.push('/servers/')
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      }
    }
  }
</script>
