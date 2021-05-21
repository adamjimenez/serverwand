<template>
  <div>

    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>
        
    <Loading :value="fetching" />

    <v-card
      class="pa-3"
    >
      <v-row>
        <v-col>
          <div class="ma-3">
              <v-btn
                @click="editServer"
              >
                Edit
              </v-btn>
          </div>

          <div class="ma-3">
              <v-btn
                :disabled="fetching"
                :loading="fetching"
                @click="reboot"
              >
                Reboot
              </v-btn>
          </div>

          <div class="ma-3">
              <v-btn
                :disabled="fetching"
                :loading="fetching"
                @click="deleteServer"
                color="error"
              >
                Disconnect
              </v-btn>
          </div>
        </v-col>
      </v-row>
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
        data: {
          users: {}
        },
        details: '',
        fetching: false,
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

        //this.fetching = true
 
        api.get('servers/' + this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          }

          if (response.data.item) {
            self.data = response.data.item
            document.title = 'Settings' + ' | ' + self.data.name
          }
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
        this.$confirm('Disconnect from server ' + this.data.name + '?').then(res => {
          if (res) {
            var self = this
            this.fetching = true

            api.get('servers/' + this.$route.params.id + '/delete')
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
            .finally(function() {
              self.fetching = false
            })
          }
        })
      },
      reboot () {
        this.$confirm('Reboot server?').then(res => {
          if (res) {
            var self = this
            this.fetching = true

            api.get('servers/' + this.serverId + '/reboot')
            .then(function (response) {
              console.log(response)

              if (response.data.success) {
                this.$router.push('/servers')
              }
            })
            .catch(function (error) {
              console.log(error)
            })
            .finally(function() {
              self.fetching = false
            })
          }
        })
      }
    }
  }
</script>
