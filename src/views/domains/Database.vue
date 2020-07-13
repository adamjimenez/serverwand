<template>
  <div>
    <v-alert
    :value="error.length>0"
    type="error"
    >
    {{error}}
    </v-alert>

    <Loading :value="loading" />
      
    <v-card 
      class="pa-3"
      :loading="fetching"
    >
        <div v-if="data.db_name==false">
            <v-btn
                :disabled="loading!=''"
                :loading="loading=='database'"
                @click="addDatabase"
                >
                Add Database
            </v-btn>
        </div>

        <div v-else>
          <v-layout row>
            <v-flex xs12>
              <v-card tile flat>
                <v-card-text>
                  <form :action="'http://' + data.server.ip + '/phpmyadmin/'" method="post" target="_blank">
                    <input type="hidden" name="pma_username" :value="data.db_name">
                    <button type="submit">
                      PhpMyAdmin
                      <v-icon right>open_in_new</v-icon>
                    </button>
                  </form>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
              <v-card tile flat>
              <v-card-text>DB Name:</v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>
                    {{data.db_name}}
                    <Copy :val="data.db_name" />
                </v-card-text>
                </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
              <v-card tile flat>
                <v-card-text>DB Username:</v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs6>
              <v-card tile flat>
                <v-card-text>
                    {{data.db_name}}
                    <Copy :val="data.db_name" />
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

          <v-expansion-panels>
            <v-expansion-panel
                v-model="dbPasswordPanel"
                expand
            >
              <v-expansion-panel-header class="pa-1">Reset db password</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-form
                  ref="dbPasswordForm"
                  v-model="dbPasswordFormValid"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-text-field
                          v-model="dbPassword"
                          :append-icon="showDbPassword ? 'visibility_off' : 'visibility'"
                          :rules="[rules.required, rules.min]"
                          :type="showDbPassword ? 'text' : 'password'"
                          name="db_password"
                          label="Password"
                          hint="At least 8 characters"
                          counter
                          @click:append="showDbPassword = !showDbPassword"
                      ></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="primary" @click="submitDbPassword">Submit</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

        </div>            

    </v-card>
 
  </div>  
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'

  export default {
    components: {
      Loading,
      Copy
    },
    data () {
      return {
        domainId: null,
        post: null,
        error: null,
        data: {
          disk_usage: 0,
          server: {},
          app: {}
        },
        details: '',
        loading: false,
        fetching: false,
        dbPasswordPanel: [false],
        dbPasswordFormValid: true,
        showDbPassword: false,
        password: '',
        dbPassword: '',
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        },
        copyText: 'Copy'
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId + '/database')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Database' + ' | ' + self.data.domain
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addDatabase () { 
        var self = this
        this.error = ''
        this.loading = true

        api.post('domains/' + this.domainId + '/database', {save: 1})
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
          self.loading = false
        })
      },
      submitDbPassword () { 
        var self = this
        this.error = ''

        if (this.$refs.dbPasswordForm.validate()) {
          this.details = ''
          this.loading = true
          
          api.post('domains/' + this.domainId + '/database', {save: 1, password: self.dbPassword})
          .then(function (response) {
            console.log(response)
            if (response.data.error) {
              self.error = response.data.error
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function() {
            self.fetching = false
            self.loading = false
            self.dbPasswordPanel = [false]
          })
        }
      }
    }
  }
</script>