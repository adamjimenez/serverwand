<template>
    <div>
        <v-alert
        :value="error.length>0"
        type="error"
        >
        {{error}}
        </v-alert>

        <Loading :value="fetching" />

        <v-card>
          <div>
            <v-card-title primary-title>
              <v-switch
                  v-model="data.email"
                  label="Email"
                  @change="toggleEmail()"
              ></v-switch>
            </v-card-title>
          </div>
        </v-card>

        <v-card>
          <!--
          <div>
            <v-layout row v-if="!data.server.ip">
                <v-flex xs12>
                <v-card tile flat>
                    <v-card-text>
                      <strong>Warning: Domain does not point to: {{data.server.ip}} <Copy :val="data.server.ip" /> ({{item.dns.error}})</strong>
                      <v-btn v-if="item.dns.not_set" @click="fixAliasDns(item.domain)">Fix</v-btn>
                    </v-card-text>
                </v-card>
                </v-flex>
            </v-layout>
          </div>
          -->
          <div>
            <v-layout row>
              <v-flex xs12>
                <v-card tile flat>
                  <v-card-text>
                    <p>IMAP server: imap.domain.com</p>
                    <p>SMTP server: smtp.domain.com</p>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </div>
        </v-card>

        <v-card>
          <template v-for="(item, index) in data.emails">
            <div
            :key="index"
            >
              <v-layout row
                  
              >
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                    {{item.user}}
                    </v-card-text>
                  </v-card>
                </v-flex>            

                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                      <v-btn
                      :disabled="fetching"
                      :loading="fetching"
                      @click="editEmail(index)"
                      >
                      Edit
                      </v-btn>

                      <v-btn
                      :disabled="fetching"
                      :loading="fetching"
                      @click="deleteEmail(item.user)"
                      >
                      Delete
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>

              <v-divider></v-divider>
            </div>
          </template>
        </v-card>

        <v-card>
          <div>
            <v-btn
                @click="addEmail()"
            >
              Add email
            </v-btn>
          </div>
        </v-card>        


        <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
        right
        >

          <v-card>
            <v-card-title>
              Email account
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="email.user"
                label="Name"
                required
                :readonly="userReadonly"
              ></v-text-field>

              <v-text-field
                type="password"
                v-model="email.password"
                label="Password"
                required
              ></v-text-field>

              <v-text-field
                v-model="email.destination"
                label="Forwarding"
                required
              ></v-text-field>
              
              <v-btn
                :disabled="fetching"
                :loading="fetching"
                color="success"
                @click="saveEmail()"
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
  import Copy from '../../components/Copy'

  export default {
    components: {
      Loading,
      Copy
    },
    data () {
      return {
        loading: false,
        domainId: null,
        post: null,
        error: null,
        data: {
          email: false,
          emails: []
        },
        email: {},
        fetching: true,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        },
        copyText: 'Copy',
        drawer: false,
        userReadonly: false
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      format: function(size) {
        if (size === '' || size === -1) {
          return ''
        }

        var si
        for(si = 0; size >= 1024; size /= 1024, si++) {}

        return '' + Math.round(size) + 'KMGT'.substr(si, 1)
      },
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId + '/email')
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
      },
      toggleEmail () { 
        var self = this
        this.error = ''
        this.fetching = true
        this.loading = true

        api.post('domains/' + this.$route.params.id  + '/setemail', {status: this.data.email})
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          } else if (response.data.success) {
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
      addEmail () {
        this.drawer = true
        this.userReadonly = false
        this.email = {}
      },
      editEmail (index) {
        this.drawer = true
        this.userReadonly = true
        this.email = this.data.emails[index];
      },
      saveEmail () {
        var self = this

        if (this.email.user) {
          this.fetching = true
          this.error = ''

          api.post('domains/' + this.domainId + '/saveemail', this.email)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error
              self.fetching = false
            } else {
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
        }
      },
      deleteEmail (user) {
        this.$confirm('Delete ' + user + '?').then(res => {
          if (res) {
            var self = this
            this.fetching = true
            this.error = ''

            api.post('domains/' + this.domainId + '/deleteemail', {user: user})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error
                self.fetching = false
              } else {
                self.fetchData()
              }
            })
            .catch(function (error) {
              console.log(error)
              self.fetching = false
            })
          }
        })
      },
    }
  }
</script>

<style>
.v-expansion-panel__header {
  padding: 10px 16px;
}
</style>