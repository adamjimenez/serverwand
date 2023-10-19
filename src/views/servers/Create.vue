<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching" class="pb-5" title="Server details">
      <v-card-subtitle v-if="!serverId">
        Choose a VPS provider below or connect to a server freshly installed with Ubuntu
      </v-card-subtitle>

      <v-card-text>

        <v-list v-if="!serverId" :items="items" @click:select="getOptions"></v-list>

        <v-form v-if="data.provider || serverId" ref="form" v-model="valid" class="mt-5">

          <v-select v-if="unclaimed.length" v-model="data.unclaimed" :items="unclaimed" label="Server"></v-select>

          <v-text-field v-model="data.name" label="Name" :rules="[rules.required, rules.alphanumeric]"
            required></v-text-field>

          <v-text-field v-if="data.provider === 'custom' || this.serverId > 0" v-model="data.ip"
            :rules="[rules.required, rules.ip]" label="Server IP"></v-text-field>

          <div v-if="data.provider !== 'custom' && data.provider !== 'vultr' && !unclaimed.length">
            <v-select v-if="!serverId" v-model="data.region" :items="regions" label="Region"></v-select>

            <v-select v-if="!serverId" v-model="data.type" :items="types" label="Type"></v-select>

            <v-select v-if="!serverId && images.length" v-model="data.image" :items="images" label="Image"></v-select>
          </div>

          <div v-if="data.provider == 'custom' || data.provider == 'vultr'">
            <v-text-field :disabled="serverId > 0" v-model="data.hostname" label="Host name" :rules="[rules.required]"
              required></v-text-field>

            <div v-if="data.provider == 'custom'">
              <v-text-field :disabled="serverId > 0" v-model="data.user" label="Username" :rules="[rules.required]"
                required></v-text-field>

              <v-text-field type="password" :disabled="serverId > 0" v-model="data.pass" label="Password"
                required></v-text-field>
            </div>
          </div>

          <v-text-field v-if="serverId > 0 || data.provider == 'custom'" v-model="data.port" label="Port"
            required></v-text-field>

          <v-select v-model="data.dns" :items="dns" label="DNS provider"
            v-if="(data.provider === 'custom' || serverId > 0)"></v-select>

          <v-select v-model="data.provider_token" :items="provider_tokens" label="DNS provider API token (optional)"
            v-if="data.dns"></v-select>

          <v-checkbox v-model="data.mailserver" label="Mailserver"></v-checkbox>

          <v-btn :disabled="!valid" :loading="dialog" color="success" @click="validate">
            Save
          </v-btn>
        </v-form>
      </v-card-text>

    </v-card>

    <v-dialog v-model="dialog" persistent width="300">
      <v-card color="primary">
        <v-card-text>
          <v-alert title="Spellcasting..." color="primary">
            <template v-slot:prepend>
              <v-icon icon="fas fa-magic fa-2x faa-horizontal animated"></v-icon>
            </template>
          </v-alert>

          <v-progress-linear :indeterminate="progress == 0" v-model="progress" color="white"></v-progress-linear>

          <div v-html="details"></div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-navigation-drawer v-model="drawer" temporary right app>
      <v-card>
        <v-card-title>
          API token
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="provider_token.label" label="Label" required></v-text-field>

          <v-text-field v-model="provider_token.token" label="Token" required></v-text-field>

          <v-btn :disabled="fetching" :loading="fetching" color="success" @click="submitToken">
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
  data: () => ({
    fetching: false,
    loading: false,
    valid: true,
    data: {
      images: [],
      unclaimed: [],
      provider: '',
      name: 'New-server',
      hostname: '',
      user: 'root',
      pass: '',
      port: '22',
      webserver: true,
      mailserver: false
    },
    dns: [{
      title: 'Linode',
      value: 'linode'
    }, {
      title: 'Digital Ocean',
      value: 'digitalocean'
    }, {
      title: 'Other',
      value: ''
    }],
    provider_tokens: [{
      title: 'Add new',
      value: 'new'
    }],
    rules: {
      alphanumeric: v => /^[a-zA-Z0-9_-]+$/g.test(v) || 'Must contain alphanumeric characters only',
      required: value => !!value || 'Required.',
      port: v => (!v || /^\d+(:\d+)?$/.test(v)) || '1-65535',
      ip: v => (!v || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v)) || 'Invalid IP address',
    },
    provider_token: {},
    drawer: false,
    dialog: false,
    details: "",
    serverId: 0,
    error: '',
    progress: 0,
    regions: [],
    types: [],
    images: [],
    unclaimed: [],
    items: [
      { title: 'Linode', value: 'linode', props: { prependIcon: 'fab fa-linode' } },
      { title: 'DigitalOcean', value: 'digitalocean', props: { prependIcon: 'fab fa-digital-ocean' } },
      { title: 'Vultr', value: 'vultr', props: { prependIcon: 'fas fa-server' } },
      { title: 'Ubuntu server', value: 'custom', props: { prependIcon: 'fab fa-ubuntu' } }
    ],
    isOpen: false,
    provider: 'Choose'
  }),

  created() {
    document.title = 'Server details'
    if (this.$route.params.id) {
      this.serverId = this.$route.params.id
    }
    this.fetchData()

    if (this.$route.query.ip) {
      this.data.hostname = this.$route.query.ip
      this.data.provider = 'vultr'
      this.provider = 'vultr'
    }
  },

  watch: {
    // call again the method if the route changes
    'data.provider_token': function () {
      if (this.data.provider_token === 'new') {
        this.drawer = true
        this.data.provider_token = ''
        this.provider_token['provider'] = this.data.dns
      }
    }
  },

  methods: {
    fetchData() {
      var self = this
      this.error = ''
      this.loading = true

      api.get('servers/' + this.serverId)
        .then(function (response) {
          console.log(response)

          if (self.serverId) {
            self.data = response.data.item
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.loading = false
        })

      api.get('providers/tokens')
        .then(function (response) {
          console.log(response)

          self.provider_tokens.splice(1)

          if (response.data.tokens) {
            response.data.tokens.forEach(function (item) {
              self.provider_tokens.push({
                text: item.label,
                value: item.id
              })
            })
          }
        })
        .catch(function (error) {
          self.error = error
        })
        .finally(function () {
          self.loading = false
        })
    },
    install() {
      var self = this

      self.dialog = true
      self.details = ''

      // subscribe to status changes
      var url = 'servers/' + self.serverId + '/install?webserver=1';
      if (self.data.mailserver) {
        url += '&mailserver=1'
      }

      api.event(
        url,
        result => {
          self.details = result.msg + '...';

          if (result.progress) {
            self.progress = result.progress;
          }
        },
        error => {
          self.error = error;
        },
        () => {
          self.dialog = false;

          if (!self.error) {
            self.$router.push('/servers/' + self.serverId + '/summary')
          }
        }
      );

    },
    validate: async function () {
      var self = this

      const { valid } = await this.$refs.form.validate()

      if (!valid) {
        return;
      }

      this.details = ''
      this.dialog = true
      this.error = ''

      if (self.data.unclaimed > 0) {
        self.serverId = self.data.unclaimed
      }

      console.log('save server');
      console.log(self.serverId);

      if (self.serverId) {
        api.post('servers/' + self.serverId + '/update', this.data)
          .then(function () {
            self.install()
          })
          .catch(function (error) {
            console.log(error)
          })
      } else {
        api.post('servers/create', this.data)
          .then(function (response) {
            console.log(response)

            if (!response.data.success) {
              self.error = response.data.error;
              self.dialog = false
            } else if (response.data.id) {
              self.serverId = response.data.id

              if (self.serverId) {
                self.install()
              }
            }
          })
          .catch(function (error) {
            console.log(error)
            self.dialog = false
          })
      }
    },
    getOptions(item, noAuthPrompt) {
      let provider = item.id;
      this.data.provider = provider
      this.provider = provider

      if (provider === 'custom' || provider === 'vultr') {
        return
      }

      var child
      if (!noAuthPrompt) {
        child = window.open('loading')
      }

      var self = this
      this.loading = true
      self.regions = []
      self.images = []
      self.types = []
      self.unclaimed = []

      api.post('providers/?cmd=options', { provider: provider })
        .then(function (response) {
          console.log(response)

          if (response.data.require_auth && !noAuthPrompt) {
            child.location = 'https://serverwand.com/account/services/' + provider

            var interval = setInterval(function () {
              if (child.closed) {
                clearInterval(interval)
                self.getOptions(item, true)
                return
              }
            }, 500)
          } else if (!response.data.require_auth) {
            if (child) {
              child.close()
            }

            self.regions = response.data.options.regions
            self.images = response.data.options.images
            self.types = response.data.options.types

            response.data.unclaimed.forEach(element => {
              self.unclaimed.push({
                title: element.label,
                value: element.id
              })
            })
          }
        })
        .catch(function (error) {
          if (child) {
            child.close()
          }
          console.log(error)
        })
        .finally(function () {
          self.loading = false
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