<template>
  <div>
    <Loading :value="loading" />

    <v-card
      class="pa-3"
      :loading="fetching"
    >

      <v-card>
        <v-card-title primary-title>
          <v-btn
            @click="editItem"
            >
            Edit
          </v-btn>
        </v-card-title>
      </v-card>

      <v-card>
        <v-card-title primary-title>
          <v-btn
            :disabled="dialog"
            :loading="dialog"
            @click="deleteItem"
            color="error"
          >
            Delete
          </v-btn>
        </v-card-title>
      </v-card>

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
        fetching: false,
        loading: false,
        error: '',
        data: {
          users: {}
        },
        dialog: false,
        details: '',
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
 
        api.get('domains/' + this.id)
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
      editItem () {           
        this.$router.push('/domains/' + this.$route.params.id + '/edit')
      },
      deleteItem () {
        this.$confirm('Delete ' + this.data.name + '?').then(res => {
          if (res) {
            var self = this
            this.dialog = true
            this.loading = true

            api.post('domains/' + this.id, {delete: 1})
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
              self.dialog = false
              self.loading = false
            })
          }
        })
      }
    }
  }
</script>
