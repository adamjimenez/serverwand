<template>
  <div>
    <v-card>
      <v-card-text>
        <v-alert
          :value="error.length>0"
          type="error"
        >
        {{error}}
        </v-alert>

        <v-text-field
          v-model="data.edition"
          label="Edition"
          disabled
          readonly
        ></v-text-field>

        <v-text-field
          v-model="data.email"
          :rules="usernameRules"
          label="Email"
          disabled
          required
        ></v-text-field>
      </v-card-text>

      <v-expansion-panel
        v-model="passwordPanel"
        expand
      >
        <v-expansion-panel-content>
          <v-icon slot="actions" color="primary">$vuetify.icons.expand</v-icon>
          <div slot="header">Reset password</div>
          <v-card tile flat>
            <v-card-text class="grey lighten-3">                                
              <v-text-field
                type="password"
                v-model="data.password"
                :rules="passwordRules"
                label="Password"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="grey lighten-3">
              <v-btn color="primary" flat @click="validate">Submit</v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-card-text>
        <v-subheader>Preferences</v-subheader>

        <v-checkbox
          v-model="data.emails"
          label="Receive email updates"
          @click="toggleEmails()"
        ></v-checkbox>
      </v-card-text>

      <v-card-text>
        <v-subheader>Security</v-subheader>

        <v-checkbox
          v-model="useMasterPassword"
          label="Use a master password"
          @click="toggleMasterPassword()"
        ></v-checkbox>

        <v-card-actions>
          <v-btn @click="changeMasterPassword()" :disabled="!useMasterPassword">Change master password</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>

    <v-dialog v-model="masterPasswordDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Master password</span>
        </v-card-title>

        <v-card-text>          
          <p>A Master Password is used to protect your server keys</p>

          <v-text-field
              v-model="mp.current"
              type="password"
              label="Current password"
              required
              browser-autocomplete="new-password"
              :disabled="!data.prefs.useMasterPassword"
          ></v-text-field>
        
          <v-text-field
              v-model="mp.password"
              type="password"
              label="Enter new password"
              required
              browser-autocomplete="new-password"
          ></v-text-field>
        
          <v-text-field
              v-model="mp.confirm"
              type="password"
              label="Re-enter password"
              required
              browser-autocomplete="new-password"
          ></v-text-field>

          <p>Please make sure you remember the Master Password you have set. If you forget your Master Password you will be unable to access any of the information protected by it.</p>          
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="masterPasswordDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="saveMasterPassword()" :disabled="!mp.password || mp.password != mp.confirm || (data.prefs.useMasterPassword && !mp.current)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removePasswordDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Remove master password</span>
        </v-card-title>
        <v-card-text>
          
          <p>Once removed your passwords will no longer be protected</p>

          <v-text-field
              v-model="mp.password"
              type="password"
              label="Current password"
              required
              browser-autocomplete="new-password"
          ></v-text-field>
        
          <v-checkbox
            v-model="mp.forceRemove"
            label="Force remove password (will lose existing passwords)"
          ></v-checkbox>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="removePasswordDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="removeMasterPassword()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
  import api from '../../services/api'
  import { sha256, sha224 } from 'js-sha256'

  export default {
    data: () => ({
      valid: true,
      mp: {
        current: '',
        password: '',
        confirm: '',
      },
      data: {
        edition: '',
        email: '',
        password: '',
        prefs: {}
      },
      usernameRules: [
        v => !!v || 'Email is required'
      ],
      passwordRules: [
      ],
      loading: false,
      error: '',
      useMasterPassword: false,
      masterPasswordDialog: false,
      removePasswordDialog: false,
      passwordPanel: [false]
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      document.title = 'Profile'
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = true
 
        api.profile()
        .then(function (response) {
          console.log(response)
          self.data = response.data.profile
          self.useMasterPassword = self.data.prefs.useMasterPassword
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      validate () {
        var self = this

        if (this.$refs.form.validate()) {
          this.dialog = true

          api.update(this.data)
          .then(function (response) {
            console.log(response)
            if (response.data.success) {
                self.$router.push('/')
            } else {
                self.error = response.data.error;
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function (error) {
            self.dialog = false
            self.loading = false
          })
        }
      },
      changeMasterPassword () {
        this.masterPasswordDialog = true
      },
      toggleMasterPassword () {
        this.useMasterPassword = this.data.prefs.useMasterPassword

        if (this.useMasterPassword) {
          this.removePasswordDialog = true
        } else {
          this.masterPasswordDialog = true
        }
      },
      saveMasterPassword() {
        var self = this
        this.masterPasswordDialog = false
        this.loading = true

        var masterPassword = sha256(self.mp.current)
        var newMasterPassword = sha256(self.mp.password)

        api.post('settings/savemasterpassword', {
          useMasterPassword: 1,
          masterPassword: masterPassword,
          newMasterPassword: newMasterPassword
        })
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
              self.fetchData()
          } else {
              self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function (error) {
          self.dialog = false
          self.loading = false
        })

        //this.fetchData()
      },
      removeMasterPassword() {
        var self = this
        this.removePasswordDialog = false
        this.loading = true
        var masterPassword = ''

        if (self.mp.password) {
          masterPassword = sha256(self.mp.password)
        }

        api.post('settings/removemasterpassword', {
          masterPassword: masterPassword,
          forceRemove: self.mp.forceRemove
        })
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
              self.fetchData()
          } else {
              self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function (error) {
          self.loading = false
        })

        //this.fetchData()
      },
      toggleEmails() {
        var self = this
        this.loading = true

        if (self.mp.password) {
          masterPassword = sha256(self.mp.password)
        }

        api.post('settings/profile', {
          emails: self.data.emails
        })
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
              self.fetchData()
          } else {
              self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function (error) {
          self.loading = false
        })
      }
    }
  }
</script>