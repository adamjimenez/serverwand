<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addAlias()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.aliases" :key="`item-${i}`" :title="item.domain" :subtitle="item.value">
          <v-list-item-subtitle>
            <span v-if="item.redirect">
              Redirect
            </span>
            <span v-else>
              Alias
            </span>
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-list-item-action v-if="item.dns.A != data.server.ip">
              <v-tooltip :text="'Fix DNS mismatch ' + item.dns.A + ' => ' + data.server.ip">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon @click="fixAliasDns(item.domain)">
                    <v-icon size="x-small">fas fa-wrench</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </v-list-item-action>

            <v-list-item-action>
              <v-btn :disabled="fetching" :loading="loading === item.name" @click.stop="deleteAlias(item.domain)" icon="mdi:mdi-delete" size="small"></v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Domain alias">
        <v-card-text>
          <v-text-field v-model="alias.alias" label="Alias" required></v-text-field>

          <v-checkbox v-model="alias.dns" label="Configure DNS" :disabled="data.server.dns == ''"></v-checkbox>

          <v-checkbox v-model="alias.redirect" label="Redirect"></v-checkbox>

          <v-btn :disabled="!alias.alias" :loading="fetching" color="success" @click="submitAlias" text="Save"></v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from '../../services/api'
import Loading from '../../components/Loading'
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Confirm
  },
  data() {
    return {
      siteId: null,
      post: null,
      error: null,
      data: {
        disk_usage: 0,
        server: {},
        app: {}
      },
      details: '',
      fetching: false,
      loading: null,
      passwordPanel: [false],
      passwordFormValid: true,
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        emailMatch: () => ('The email and password you entered don\'t match')
      },
      alias: {
        alias: '',
        redirect: false,
        dns: false
      },
      drawer: false,
      timer: null
    }
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetchData'
  },
  methods: {
    fetchData() {
      var self = this
      this.error = ''
      this.siteId = this.$route.params.id
      clearTimeout(self.timer)

      this.fetching = true

      api.get('sites/' + this.siteId + '/aliases')
        .then(function (response) {
          console.log(response)

          self.data = response.data.item
          document.title = 'Aliases' + ' | ' + self.data.domain

          self.data.aliases.forEach(element => {
            if (element.dns.updating) {
              console.log('checking dns')
              self.timer = setTimeout(self.fetchData, 60000)
              return
            }
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.fetching = false
        })
    },
    addAlias() {
      this.alias = {}
      this.drawer = true
    },
    submitAlias() {
      this.saveAlias();
    },
    saveAlias(noAuthPrompt) {
      var self = this

      if (this.alias.alias) {
        this.details = ''
        this.fetching = true
        this.error = ''

        var child
        if (!noAuthPrompt && this.alias.dns) {
          child = window.open('/loading')
        }

        console.log(this.alias)

        api.post('sites/' + this.siteId + '/aliases', this.alias)
          .then(function (response) {
            console.log(response)

            if (!response.data.success) {
              if (response.data.error == 'auth' && !noAuthPrompt) {
                child.location = 'https://serverwand.com/account/services/' + self.data.server.dns

                var interval = setInterval(function () {
                  if (child.closed) {
                    clearInterval(interval)
                    self.saveAlias(true)
                    return
                  }
                }, 500)
              } else {
                self.error = response.data.error
              }
            } else {
              if (child) {
                child.close()
              }
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
          .finally(function () {
            self.fetching = false
          })
      }
    },
    deleteAlias: async function (alias) {
      if (!await this.$refs.confirm.open("Delete " + alias)) {
        return;
      }
      var self = this
      this.fetching = true
      this.error = ''
      this.loading = alias;

      api.post('sites/' + this.siteId + '/aliases', { delete: 1, alias: alias })
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
          self.fetching = false
        })
        .finally(function () {
          self.loading = null;
        });
    },

    fixAliasDns(alias, noAuthPrompt) {
      var self = this

      this.details = ''
      this.fetching = true
      this.error = ''

      api.post('sites/' + self.siteId + '/fixaliasdns', { alias: alias })
        .then(function (response) {
          console.log(response)

          if (!response.data.success) {
            if (response.data.error == 'auth' && !noAuthPrompt) {
              var child = window.open('https://serverwand.com/account/services/' + self.data.server.dns)
              var interval = setInterval(function () {
                if (child.closed) {
                  clearInterval(interval)
                  self.fixAliasDns(alias, true)
                  return
                }
              }, 500)
            } else {
              self.error = response.data.error
            }
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
        })
        .finally(function () {
          self.fetching = false
        })
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
}
</script>