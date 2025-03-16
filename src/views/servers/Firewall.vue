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
            <v-btn icon :disabled="fetching" :loading="loading == item.id" @click.stop="deleteItem(item)"
              v-if="item.comment != 'ServerWand'">
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            Firewall rule
          </div>

         <v-btn
           icon="mdi:mdi-close"
           variant="text"
           @click="drawer = false"
          ></v-btn>
        </v-card-title>

        <v-form v-model="valid" title="Firewall rule">
          <v-card-text>
            <v-text-field v-model="item.port" label="Port range" placeholder="80, 443, 5000:5010" required
              :rules="[rules.required, rules.port]" autofocus>
            </v-text-field>

            <v-select v-model="item.protocol" :items="protocol" label="Protocol"></v-select>

            <v-select v-model="item.action" :items="action" label="Action" required></v-select>

            <IP v-model="item.from" label="From" :remoteAddr="data.remote_addr" any />

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
      loading: '',
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
      this.error = ''
      this.fetching = true

      api.get('servers/' + this.serverId + '/firewall')
        .then(response => {
          if (response.data.error) {
            this.error = response.data.error
            return false
          }

          this.active = response.data.active
          this.items = response.data.rules
          this.data = response.data.item
          document.title = 'Firewall' + ' | ' + this.data.name
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          this.fetching = false
        })
    },
    toggle() {
      this.fetching = true
      this.error = ''

      api.post('servers/' + this.serverId + '/firewall', { status: this.active })
        .then(response => {
          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData()
          }
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          this.fetching = false
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
      let label = item.port + '/' + item.protocol + ' ' + item.action + ' from ' + item.from;

      if (!await this.$refs.confirm.open("Delete " + label)) {
        return;
      }
      this.loading = item.id
      this.error = ''
      let response = await api.post('servers/' + this.serverId + '/firewall', { id: item.id });

      this.fetching = false;
      if (!response.data.success) {
        this.error = response.data.error;
      } else {
        this.fetchData();
      }
    },
    saveItem: async function () {
      this.error = ''
      this.fetching = true
      api.post('servers/' + this.serverId + '/firewall', this.item)
        .then(response => {
          if (response.data.success) {
            this.drawer = false
            this.fetchData()
          } else {
            this.error = response.data.error
              ? response.data.error
              : response.data;
          }
        })
        .catch((error) => {
          this.error = error
        })
        .finally(() => {
          this.fetching = false
        })
    },
  },
}
</script>
