<template>
  <div>
    <v-alert
        :value="error.length>0"
        type="error"
    >
    {{error}}
    </v-alert> 

    <Loading :value="fetching" />

    <template v-for="(item, index) in items">
      <v-card 
      :key="index"
      >
        <v-card-title primary-title>
            {{item.label}}<br>
            {{item.api_key}}
            
            <div>
                <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteItem(item.id)"
                    >
                    Delete
                </v-btn>
            </div>
        </v-card-title>
      </v-card>
    </template>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn
          @click="addItem()"
          >
            Add API key
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer
        app
        v-model="drawer"
        absolute
        temporary
        right
    >
      <v-card>
        <v-card-title>
          API key
        </v-card-title>

        <v-card-text>
          <v-text-field
              v-model="data.label"
              label="Label"
          ></v-text-field>
          
          <v-btn
          :disabled="dialog"
          :loading="dialog"
          color="success"
          @click="saveItem"
          >
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
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
        loading: '',
        error: null,
        data: {
            label: '',
        },
        items: [],
        dialog: false,
        details: '',
        fetching: true,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        server: {
          name: ''
        },
        drawer: false
      }
    },
    created () {
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
 
        api.get('apikeys')
        .then(function (response) {
          console.log(response)            
          self.items = response.data.items
          document.title = 'Api'
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addItem () {
        this.data.label = ''
        this.drawer = true
      },
      saveItem () {
        var self = this
        this.details = ''
        this.dialog = true
        this.error = ''

        api.post('apikeys', this.data)
        .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
                self.error = response.data.error
            } else {
                self.error = 'Api key: ' + response.data.api_key

                self.drawer = false
                self.fetchData()
            }
        })
        .catch(function (error) {
            console.log(error)              
            self.dialog = false
        })
        .finally(function() {
            self.dialog = false
        })
      },
      deleteItem (id) { 
        var self = this
        this.error = ''
        this.dialog = true
        this.loading = 'delete'

        api.post('apikeys', {delete: 1, api_key: id})
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.fetchData()
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