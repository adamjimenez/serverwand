<template>
    <div>
        <Loading :value="fetching" />

        <v-card>
            <v-card-title primary-title>
              <div>
                  <v-btn
                      @click="editItem"
                      >
                      Edit
                  </v-btn>
              </div>
              <div>
                  <v-btn
                      :disabled="dialog"
                      :loading="dialog"
                      @click="deleteItem"
                      >
                      Delete
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
        this.fetching = false
      },
      editItem () { 
        this.$router.push('/teams/' + this.$route.params.id + '/edit')
      },
      deleteItem () {
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
    }
  }
</script>
