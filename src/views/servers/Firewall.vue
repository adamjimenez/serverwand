<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
        <v-switch v-model="active" label="Active" @change="toggle()" hide-details color="primary"></v-switch>
      </v-card-actions>

      <v-list max-width="600">
        <v-list-item v-for="(item, i) in items" :key="`item-${i}`" :value="item" @click="editItem(item)">
          <template v-slot:default>
            <v-list-item-title>
              {{ item.port }}/{{ item.protocol }} {{ item.action }} from {{ item.from }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.comment }}
            </v-list-item-subtitle>
          </template>

          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="fetching" @click.stop="deleteItem(item)"
              v-if="item.comment != 'ServerWand'">
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card>
        <v-form v-model="valid" title="Firewall rule">
          <v-card-text>
            <v-text-field v-model="item.port" label="Port range" placeholder="80, 443, 5000:5010" required
              :rules="[rules.required, rules.port]">
            </v-text-field>

            <v-select v-model="item.protocol" :items="protocol" label="Protocol"></v-select>

            <v-select v-model="item.action" :items="action" label="Action" required></v-select>

            <IP v-model="item.from" label="From" :remoteAddr="data.remote_addr" />

            <v-text-field v-model="item.comment" label="Comment"></v-text-field>

            <v-btn :disabled="!valid" :loading="fetching" color="success" @click="saveItem">
              Save
            </v-btn>
          </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>

    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from '../../services/api'
import Loading from '../../components/Loading'
import Confirm from "../../components/ConfirmDialog.vue";
import IP from "../../components/IP.vue";

export default {
  components: {
    Loading,
    Confirm,
    IP,
  },
  data() {
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
      protocol: [{
        title: 'TCP',
        value: 'tcp'
      }, {
        title: 'UDP',
        value: 'udp'
      }],
      action: [{
        title: 'Allow',
        value: 'ALLOW'
      }, {
        title: 'Deny',
        value: 'DENY'
      }],
      direction: ['IN', 'OUT'],
      rules: {
        required: value => !!value || 'Required.',
        port: v => (!v || /^\d+(:\d+)?$/.test(v)) || '1-65535',
        ip: v => (!v || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v)) || 'Invalid IP address',
      },
      valid: false,
    }
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id
    this.fetchData()
  },
  methods: {
    fetchData() {
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
        .finally(function () {
          self.fetching = false
        })
    },
    toggle() {
      var self = this
      this.fetching = true
      this.error = ''

      api.post('servers/' + this.serverId + '/firewall', { status: this.active })
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
        .finally(function () {
          self.fetching = false
        })
    },
    addItem() {
      this.item = {}
      this.drawer = true
    },
    editItem(item) {
      if (item.comment == 'ServerWand') {
        return;
      }

      this.item = JSON.parse(JSON.stringify(item));

      if (this.item.from.substr(0, 8) === 'Anywhere') {
        this.item.from = '';
      }

      this.drawer = true;
    },
    deleteItem: async function (item) {
      var label = item.port + '/' + item.protocol + ' ' + item.action + ' from ' + item.from;

      if (!await this.$refs.confirm.open("Delete " + label)) {
        return;
      }
      this.fetching = true
      this.error = ''
      var response = await api.post('servers/' + this.serverId + '/firewall', { id: item.id });
      console.log(response)

      this.fetching = false;
      if (!response.data.success) {
        this.error = response.data.error;
      } else {
        self.fetchData();
      }
    },
    saveItem: async function () {
      var self = this
      this.error = ''
      this.fetching = true
      api.post('servers/' + this.serverId + '/firewall', this.item)
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
            self.drawer = false
            self.fetchData()
          } else {
            self.error = response.data.error
              ? response.data.error
              : response.data;
          }
        })
        .catch(function (error) {
          self.error = error
        })
        .finally(function () {
          self.fetching = false
        })
    },
  },
}
</script>
