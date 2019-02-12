<template>
  <v-layout row>
    <v-flex>
        <v-alert
        :value="error.length>0"
        type="error"
        >
        {{error}}
        </v-alert>

        <Loading :value="fetching" />
        
        <v-subheader v-if="!fetching">
        {{ data.name }}
        </v-subheader>

        <v-tabs>
            <v-tab :to="'/teams/' + id + '/members'">Members</v-tab>
            <v-tab :to="'/teams/' + id + '/servers'">Servers</v-tab>
            <v-tab :to="'/teams/' + id + '/settings'">Settings</v-tab>
        </v-tabs>
        <router-view></router-view>      

    </v-flex>

    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          Please stand by
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>

          <div v-html="details"></div>
              
        </v-card-text>
      </v-card>
    </v-dialog>

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
        loading: '',
        id: null,
        error: null,
        data: {
        },
        dialog: false,
        details: '',
        fetching: true,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        member: {
          email: ''
        },
        memberDrawer: false
      }
    },
    created () {
        // fetch the data when the view is created and the data is
        // already being observed      
        this.id = this.$route.params.id
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
 
        api.get('teams/' + this.id)
        .then(function (response) {
          console.log(response)            
          self.data = response.data.item
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