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

    <v-dialog v-model="drawer" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            Domain alias
          </div>

         <v-btn
           icon="mdi:mdi-close"
           variant="text"
           @click="drawer = false"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="alias.alias" label="Alias" required autofocus></v-text-field>

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
      this.error = ''
      this.siteId = this.$route.params.id
      clearTimeout(this.timer)

      this.fetching = true

      api.get('sites/' + this.siteId + '/aliases')
        .then((response) => {
          console.log(response)

          this.data = response.data.item
          document.title = 'Aliases' + ' | ' + this.data.domain

          this.data.aliases.forEach(element => {
            if (element.dns.updating) {
              console.log('checking dns')
              this.timer = setTimeout(this.fetchData, 60000)
              return
            }
          })
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          this.fetching = false
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
          .then((response) => {
            console.log(response)

            if (!response.data.success) {
              if (response.data.error == 'auth' && !noAuthPrompt) {
                child.location = 'https://serverwand.com/account/services/' + this.data.server.dns

                var interval = setInterval(() => {
                  if (child.closed) {
                    clearInterval(interval)
                    this.saveAlias(true)
                    return
                  }
                }, 500)
              } else {
                this.error = response.data.error
              }
            } else {
              if (child) {
                child.close()
              }
              this.drawer = false
              this.fetchData()
            }
          })
          .catch((error) => {
            console.log(error)
            this.fetching = false
          })
          .finally(() => {
            this.fetching = false
          })
      }
    },
    deleteAlias: async function (alias) {
      if (!await this.$refs.confirm.open("Delete " + alias)) {
        return;
      }
      
      this.fetching = true
      this.error = ''
      this.loading = alias;

      api.post('sites/' + this.siteId + '/aliases', { delete: 1, alias: alias })
        .then((response) => {
          console.log(response)

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData()
          }
        })
        .catch((error) => {
          console.log(error)
          this.fetching = false
        })
        .finally(() => {
          this.loading = null;
        });
    },

    fixAliasDns(alias, noAuthPrompt) {
      this.details = ''
      this.fetching = true
      this.error = ''

      api.post('sites/' + this.siteId + '/fixaliasdns', { alias: alias })
        .then((response) => {
          console.log(response)

          if (!response.data.success) {
            if (response.data.error == 'auth' && !noAuthPrompt) {
              let child = window.open('https://serverwand.com/account/services/' + this.data.server.dns)
              let interval = setInterval(() => {
                if (child.closed) {
                  clearInterval(interval)
                  this.fixAliasDns(alias, true)
                  return
                }
              }, 500)
            } else {
              this.error = response.data.error
            }
          } else {
            this.fetchData()
          }
        })
        .catch((error) => {
          console.log(error)
          this.fetching = false
        })
        .finally(() => {
          this.fetching = false
        })
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
}
</script>