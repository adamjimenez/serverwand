<template>
  <div>
    <v-alert
        v-if="error"
        type="error"
    >
        {{error}}
    </v-alert> 

    <Loading :value="fetching" />

    <v-card
        class="mx-auto"
    >
        <v-list>
        <v-list-item-group>
            <template v-for="(item, i) in items">

            <v-list-item
                :key="`item-${i}`"
                :value="item"
            >
                <template v-slot:default>

                <v-list-item-content>
                    <v-list-item-title @click="editItem(item)">
                        {{item.name}}
                    </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteItem(item.id)"
                  >
                    <v-icon small>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
                </template>
            </v-list-item>
            </template>
        </v-list-item-group>
        </v-list>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn
          @click="addItem()"
          >
            Add Product
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      right
      app
    >
      <v-card>
          <v-card-title>
            Product
          </v-card-title>

          <v-card-text>

            <v-text-field
              v-model="data.name"
              label="Name"
              required
            ></v-text-field>

            <v-select
                v-model="data.product_type"
                :items="product_types"
                label="Type"
            ></v-select>

            <v-text-field
              v-model="data.price"
              label="Price"
              required
            ></v-text-field>

            <v-select
                v-model="data.period"
                :items="periods"
                label="Period"
            ></v-select>
            
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="saveItem"
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

  export default {
    components: {
      Loading
    },
    data () {
      return {
        id: null,
        error: '',
        data: {
            name: '',
        },
        product_types: [{
          text: 'Domain renewal',
          value: 'domain renewal'
        }, {
          text: 'Hosting',
          value: 'hosting'
        }, {
          text: 'Custom',
          value: 'custom'
        }],
        periods: [{
          text: 'One off',
          value: 'one-off'
        }, {
          text: 'Monthly',
          value: 'monthly'
        }, {
          text: 'Yearly',
          value: 'yearly'
        }],
        items: [],
        dialog: false,
        details: '',
        fetching: true,
        server: {
          name: ''
        },
        provider_token: {},
        drawer: false
      }
    },
    created () {
        this.id = this.$route.params.id
        this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('settings/products')
        .then(function (response) {
          console.log(response)
          self.items = response.data.products
          document.title = 'Products'
        })
        .catch(function (error) {
          self.error = error
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addItem () {
        this.data.label = ''
        this.data = {}
        this.drawer = true
      },
      editItem (item) {
        this.data = JSON.parse( JSON.stringify( item ) ) 
        this.drawer = true
      },
      deleteItem (id) { 
        this.$confirm('Delete subscription?').then(res => {
            if (!res) {
               return
            }

            var self = this
            this.error = ''

            api.post('settings/products/' + id, {delete: 1})
            .then(function (response) {
            console.log(response)
            
            if (response.data.error) {
                self.error = response.data.error
            } else {
                self.fetchData()
            }
            })
            .catch(function (error) {
               console.log(error)
            })
            
        })
      },
      saveItem() {
        var self = this

        var url = 'settings/products'

        if (this.data.id) {
            url += '/' + this.data.id
        }

        api.post(url, this.data)
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