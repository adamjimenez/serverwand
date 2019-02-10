<template>
    <div>
        <Loading :value="fetching" />

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

        <template v-for="(item, index) in items">
            <v-card 
                :key="index"
            >
                <v-card-title primary-title>
                    {{item.port}}/{{item.protocol}} {{item.action}} {{item.from}} {{item.v6 ? 'IPV6' : ''}}
                    
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
                            label="Port"
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
                            :disabled="dialog"
                            :loading="dialog"
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
        dialog: false,
        details: '',
        fetching: true,
        drawer: false,
        serverId: 0,
        protocol: ['tcp', 'udp'],
        action: ['allow', 'deny'],
        rules: {
          required: value => !!value || 'Required.',
          port: v => (v>=1 && v<65535) || '1-65535',
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
 
        api.firewall(this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            return false
          }
          
          self.active = response.data.active
          self.items = response.data.rules
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
        this.dialog = true
        this.error = ''

        api.setFirewallStatus(this.serverId, {status: this.active})
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
          self.dialog = false
        })
      },
      addItem() {
        this.drawer = true
      },
      deleteItem(id) {
        var self = this
        this.dialog = true
        this.error = ''

        api.deleteFirewallRule(this.serverId, {id: id})
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
          self.dialog = false
        })
      },
      saveItem () {
        var self = this
        this.error = ''

        if (this.$refs.form.validate()) {
          this.dialog = true
          
          api.saveFirewallRule(self.serverId, this.item)
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
            self.dialog = false
            self.loading = ''
          })
        }
      }
    }
  }
</script>
