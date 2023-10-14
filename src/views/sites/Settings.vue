<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <SSL :siteId="this.siteId" :provider="data.ssl_provider.provider" :fullchain="data.ssl_provider.fullchain"
      @closed="fetchData(true)" />

    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-title>
            OpenBasedir
          </v-list-item-title>
          <v-list-item-subtitle>
            <Edit :val="data.openbasedir" label="OpenBasedir" name="openbasedir"
              :path="'sites/' + this.siteId + '/openbasedir'" />
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn :disabled="fetching" :loading="loading == 'empty'" @click="empty" color="error">
          Empty Site
        </v-btn>
      </v-card-title>
    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn :disabled="fetching" :loading="loading == 'delete'" @click="deleteDomain" color="error">
          Delete Site
        </v-btn>
      </v-card-title>
    </v-card>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from '../../services/api'
import Loading from '../../components/Loading'
import Edit from '../../components/Edit'
import SSL from '../../components/SSL'
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Edit,
    SSL,
    Confirm,
  },
  data() {
    return {
      loading: false,
      siteId: null,
      post: null,
      error: null,
      data: {
        disk_usage: 0,
        server: {},
        app: {},
        ssl_provider: {
          provider: 'none'
        }
      },
      details: '',
      fetching: false,
      copyText: 'Copy'
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
      this.fetching = true
      this.siteId = this.$route.params.id

      api.get('sites/' + this.siteId + '/settings')
        .then(response => {
          console.log(response)

          self.data = response.data.item
          document.title = 'Settings' + ' | ' + self.data?.domain
        })
        .catch((error) => console.log(error))
        .finally(() => self.fetching = false)
    },
    empty: async function () {
      if (!await this.$refs.confirm.open('Empty ' + this.data.domain)) {
        return;
      }

      var self = this
      this.error = ''
      this.fetching = true
      this.loading = true

      api.get('sites/' + this.$route.params.id + '/empty')
        .then(response => {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          self.fetching = false
          self.loading = false
        })
    },
    deleteDomain: async function () {
      if (!await this.$refs.confirm.open('Delete ' + this.data.domain)) {
        return;
      }

      this.error = ''
      this.fetching = true
      this.loading = true

      api.get('sites/' + this.$route.params.id + '/delete')
        .then(response => {
          console.log(response)

          if (response.data.error)
            this.error = response.data.error
          else
            this.$router.push('/sites/')
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.fetching = false
          this.loading = false
        })
    }
  }
}
</script>