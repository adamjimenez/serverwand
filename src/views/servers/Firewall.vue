<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <Loading :value="loading" />

    <v-card>
      <div>
        <v-card-title primary-title>
            <v-switch
                v-model="active"
                label="Active"
                @change="toggle()"
            ></v-switch>
        </v-card-title>
      </div>
    </v-card>

<template>
  <v-card
    class="mx-auto"
    :loading="fetching"
  >
    <v-list>
      <v-list-item-group>
        <template v-for="(item, i) in items">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
          >
            <template v-slot:default="{ active, toggle }">
              <v-list-item-content>
                <v-list-item-title>
                  {{item.port}}/{{item.protocol}} {{item.action}} {{item.from}} {{item.v6 ? 'IPV6' : ''}}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  icon
                  :disabled="fetching"
                  :loading="fetching"
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
</template>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn
          @click="addItem()"
          >
          Add rule
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer
        app
        v-model="drawer"
        temporary
        right
    >
      <v-card>
        <v-form
            ref="form"
        >
          <v-card-title>
          Firewall rule
          </v-card-title>

          <v-card-text>
              <v-text-field
                  v-model="item.port"
                  label="Port range"
                  required
                  :rules="[rules.required, rules.port]"
              ></v-text-field>

              <v-select
                  v-model="item.protocol"
                  :items="protocol"
                  label="Protocol"
                  required
              ></v-select>

              <v-select
                  v-model="item.action"
                  :items="action"
                  label="Action"
                  required
              ></v-select>

              <v-text-field
                  v-model="item.from"
                  label="From"
                  :rules="[rules.ip]"
              ></v-text-field>                    
              
              <v-btn
                  :disabled="fetching"
                  :loading="fetching"
                  color="success"
                  @click="saveItem"
              >
                  Save
              </v-btn>
          </v-card-text>                
        </v-form>
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
        loading: false,
        error: '',
        active: false,
        items: {},
        item: {},
        details: '',
        fetching: false,
        drawer: false,
        serverId: 0,
        protocol: ['tcp', 'udp'],
        action: ['allow', 'deny'],
        rules: {
          required: value => !!value || 'Required.',
          port: v => (!v || /^\d+(-\d+)?$/.test(v)) ||  '1-65535',
          ip: v => (!v || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v)) || 'Invalid IP address',
        },
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
 
        api.get('servers/' + this.serverId + '/firewall')
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            return false
          }
          
          self.active = response.data.active
          self.items = response.data.rules
          self.data = response.data.item
          document.title = 'Firewall' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      toggle() {
        var self = this
        this.fetching = true
        this.error = ''

        api.post('servers/' + this.serverId + '/firewall', {status: this.active})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addItem() {
        this.item = {}
        this.drawer = true
      },
      deleteItem(id) {
        this.$confirm('Delete rule?').then(res => {
          if (res) {        
            var self = this
            this.fetching = true
            this.error = ''

            api.post('servers/' + this.serverId + '/firewall', {id: id})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error;
              } else {
                self.fetchData()
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
      saveItem () {
        var self = this
        this.error = ''

        if (this.$refs.form.validate()) {
          this.fetching = true
          
          api.post('servers/' + this.serverId + '/firewall', this.item)
          .then(function (response) {
            console.log(response)
            if (response.data.error) {
              self.error = response.data.error
            } else {
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function() {
            self.fetching = false
            self.loading = ''
          })
        }
      }
    }
  }
</script>
