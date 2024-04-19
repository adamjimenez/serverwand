<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <SSL :siteId="this.siteId" :provider="data.ssl_provider.provider" :fullchain="data.ssl_provider.fullchain"
      @closed="fetchData(true)" />

    <v-card>
      <v-card max-width="600">
        <v-list>
          <v-list-item>
            <v-list-item-title>
              open_basedir

              <v-tooltip location="top" text="PHP directive which controls which paths can be accessed.">
                <template v-slot:activator="{ props }">
                  <v-icon color="primary" v-bind="props">
                    mdi:mdi-information
                  </v-icon>
                </template>
              </v-tooltip>
            </v-list-item-title>
            <v-list-item-subtitle>
              <Edit :val="data.openbasedir" label="OpenBasedir" name="openbasedir"
                :path="'sites/' + this.siteId + '/openbasedir'" />
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-card-text>
          <v-btn :disabled="fetching" :loading="loading == 'empty'" @click="empty" color="error" block class="mb-4">
            Empty Site
          </v-btn>

          <v-btn :disabled="fetching" :loading="loading == 'delete'" @click="deleteDomain" color="error" block>
            Delete Site
          </v-btn>
        </v-card-text>
      </v-card>
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
      loading: null,
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
      this.error = ''
      this.fetching = true
      this.siteId = this.$route.params.id

      api.get('sites/' + this.siteId + '/settings')
        .then(response => {
          console.log(response)

          this.data = response.data.item
          document.title = 'Settings' + ' | ' + this.data?.domain
        })
        .catch((error) => console.log(error))
        .finally(() => this.fetching = false)
    },
    empty: async function () {
      if (!await this.$refs.confirm.open('Empty ' + this.data.domain)) {
        return;
      }

      this.error = ''
      this.loading = 'empty'

      api.get('sites/' + this.$route.params.id + '/empty')
        .then(response => {
          console.log(response)

          if (response.data.error) {
            this.error = response.data.error
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.loading = null
        })
    },
    deleteDomain: async function () {
      if (!await this.$refs.confirm.open('Delete ' + this.data.domain)) {
        return;
      }

      this.error = ''
      this.loading = 'delete'

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
          this.loading = null
        })
    }
  }
}
</script>