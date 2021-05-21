<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <Loading :value="loading" />

    <v-card
      :loading="fetching"
    >

        <v-data-table
          v-if="items.length"
          :headers="headers"
          :items="items"
          class="results"
        >
          <template v-slot:body="prop">
            <tbody>
              <tr v-for="item in prop.items" :key="item.id">
                <td class="text-start">
                  <v-list-item>
                    <v-checkbox v-model="item.selected"></v-checkbox>
                  </v-list-item>
                </td>
                <td class="text-start" @click="view(item.id)">
                  {{item.id}}
                </td>
                <td class="text-start">
                  {{item.size | prettyBytes}}
                </td>
                <td class="text-start">
                  {{item.sender}}
                </td>
                <td class="text-start">
                  {{item.recipient}}
                </td>
                <td class="text-start">
                  {{item.date}}
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-card-text v-else>
          Queue empty
        </v-card-text>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
            <v-btn
                @click="deleteMail()"
                :disabled="!selected"
            >
                Delete
            </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-dialog
      app
      v-model="emailDrawer"
    >
      <v-card>
          <v-card-title>
            Message: {{message_id}}
          </v-card-title>

          <v-card-text>
            <iframe width="100%" height="315" :src="message_url" frameborder="0"></iframe>
          </v-card-text>
      </v-card>
    </v-dialog>

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
        error: '',
        items: [],
        data: {},
        details: '',
        message: '',
        message_url: '',
        message_id: '',
        loading: false,
        fetching: false,
        emailDrawer: false,
        serverId: 0,
        selected: false,
        headers: [{
          text: '',
          value: ''
        }, {
          text: 'ID ',
          value: 'id'
        }, {
          text: 'Size ',
          value: 'size'
        }, {
          text: 'From ',
          value: 'from'
        }, {
          text: 'To ',
          value: 'to'
        }, {
          text: 'Date ',
          value: 'date'
        }]
      }
    },
    watch: {
        items: {
            handler: function(newItems) {
                for(var i = 0; i < newItems.length; i++) {
                    if(newItems[i].selected) {
                        this.selected = true
                        return
                    }
                }

                this.selected = false
            },
            deep: true
        }
    },
    created () {
      this.serverId = this.$route.params.id
      this.fetchData()
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('servers/' + this.serverId + '/messages')
        .then(function (response) {
          console.log(response)
          self.data = response.data.item
          self.items = response.data.messages

          self.items = []
          response.data.messages.forEach(element => {
              self.items.push({
                  id: element.id,
                  size: element.size,
                  sender: element.sender,
                  recipient: element.recipient,
                  date: element.date,
                  selected: false
              })
          })

          document.title = 'Mail' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      deleteMail() {
        var self = this
        self.fetching = true

        var ids = []
        this.items.forEach(element => {
            if (element.selected) {
                ids.push(element.id)
            }
        })

        api.post('servers/' + this.serverId + '/messages', {ids: ids})
        .then(function () {
            self.fetchData()
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      view(id) {
        this.message_id = id
        this.message_url = 'https://serverwand.com/api/servers/' + this.serverId + '/messages/' + this.message_id
        this.emailDrawer = true

        /*
        var self = this
        self.fetching = true
        api.get('servers/' + this.serverId + '/messages/' + id)
        .then(function (response) {
            self.message = response.data.message
            self.emailDrawer = true
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
        */
      }
    }
  }
</script>

<style>
  iframe {
    background-color: #fff;
    height: calc(100vh - 200px);
  }
</style>