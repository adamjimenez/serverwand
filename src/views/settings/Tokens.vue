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
        class="mx-auto"
    >
        <v-list>
        <v-list-item-group>
            <template v-for="(item, i) in items">

            <v-list-item
                :key="`item-${i}`"
                :value="item"
            >
                <template v-slot:default>

                <v-list-item-content>
                    <v-list-item-title>
                    {{item.label}}
                    </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteItem(item.id)"
                  >
                    <v-icon small>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
                </template>
            </v-list-item>
            </template>
        </v-list-item-group>
        </v-list>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn
          @click="addItem()"
          >
            Add Integration
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      right
      app
    >
      <v-card>
          <v-card-title>
            API token
          </v-card-title>

          <v-card-text>

            <v-select
                v-model="provider_token.provider"
                :items="providers"
                label="Provider"
            ></v-select>

            <v-text-field
              v-model="provider_token.label"
              label="Label"
              required
            ></v-text-field>

            <v-text-field
              v-if="provider_token.provider === 'nominet'"
              v-model="provider_token.username"
              label="Username"
              required
            ></v-text-field>

            <v-text-field
              v-if="provider_token.provider === 'nominet'"
              v-model="provider_token.password"
              label="Password"
              type="password"
              required
            ></v-text-field>

            <v-text-field
              v-model="provider_token.token"
              label="Token"
              required
            ></v-text-field>
            
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="submitToken"
            >
              Save
            </v-btn>
          </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <!--
    <v-dialog
      v-model="dialog"
      width="630"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          <div>
              Api key: {{ details }}              
              <Copy :val="details" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    -->
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
            label: '',
        },
        providers: [{
          text: 'Linode',
          value: 'linode'
        }, {
          text: 'Digital Ocean',
          value: 'digitalocean'
        }, {
          text: 'NameSilo',
          value: 'namesilo'
        }, {
          text: 'Nominet',
          value: 'nominet'
        }],
        items: [],
        dialog: false,
        details: '',
        fetching: true,
        /*
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        */
        server: {
          name: ''
        },
        provider_token: {},
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
 
        api.get('providers/tokens')
        .then(function (response) {
          console.log(response)            
          self.items = response.data.tokens
          document.title = 'Tokens'
        })
        .catch(function (error) {
          self.error = error
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addItem () {
        this.data.label = ''
        this.drawer = true
      },
      deleteItem (id) { 
        this.$confirm('Delete subscription?').then(res => {
          if (!res) {
              return
          }
          
          var self = this
          this.error = ''

          api.post('providers/tokens/' + id, {delete: 1})
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
            
        })
      },
      submitToken() {
        var self = this

        api.post('providers/tokens', this.provider_token)
        .then(function (response) {
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.drawer = false
            self.fetchData()
          }
        })
        .catch(function (error) {
          self.error = error
        })
      }
    }
  }
</script>