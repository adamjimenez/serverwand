<template>
  <v-card
    class="mx-auto"
  >
    <v-row>
      <v-col>
        <div class="ma-3">
          <v-btn
              @click="editItem"
              >
              Edit Name
          </v-btn>
        </div>

        <div class="ma-3">
          <v-btn
            :disabled="dialog"
            :loading="dialog"
            @click="deleteItem"
            color="error"
          >
            Delete
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
  import api from '../../services/api'

  export default {
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
        id: 0
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.id = this.$route.params.id
      this.fetchData()
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('teams/' + this.id)
        .then(function (response) {
          console.log(response)            
          self.data = response.data.item
          document.title = 'Settings' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      editItem () { 
        this.$router.push('/teams/' + this.$route.params.id + '/edit')
      },
      deleteItem () {
        this.$confirm('Delete ' + this.data.name + '?').then(res => {
          if (res) {
            var self = this
            this.dialog = true

            api.post('teams/' + this.id, {delete: 1})
            .then(function (response) {
                console.log(response)
              
                if (response.data.error) {
                    self.error = response.data.error
                } else {
                    self.$router.push('/teams/')
                }
            })
            .catch(function (error) {
                console.log(error)
            })
            .finally(function() {
                self.dialog = false
                self.loading = ''
            })
          }
        })
      }
    }
  }
</script>
