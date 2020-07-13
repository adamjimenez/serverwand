<template>
  <div>
    <v-alert
      :value="error.length>0"
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
                {{item.sender}}
              </td>
              <td class="text-start">
                {{item.recipient}}
              </td>
              <td class="text-start">
                {{item.date}}
              </td>
            </tr>
          </template>
        </v-data-table>

        <v-card-text v-else>
          Queue empty
        </v-card-text>
    </v-card>

    <v-card>
        <div>
            <v-btn
                @click="deleteMail()"
                :disabled="!selected"
            >
                Delete
            </v-btn>
        </div>
    </v-card>

        <v-dialog
          app
          v-model="emailDrawer"
        >
          <v-card>
              <v-card-title>
                Message
              </v-card-title>

              <v-textarea
                auto-grow
                v-model="message"
                readonly
              >
              </v-textarea>
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
        // this.fetching = true
 
        api.get('servers/' + this.serverId + '/messages')
        .then(function (response) {
          console.log(response)
          self.data = response.data.item
          self.items = response.data.messages

          self.items = []
          response.data.messages.forEach(element => {
              self.items.push({
                  id: element.id,
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
          self.fetching = false
        })
        .finally(function() {
        })
      },
      view(id) {
        var self = this

        api.get('servers/' + this.serverId + '/messages/' + id)
        .then(function (response) {
            self.message = response.data.message
            self.emailDrawer = true
        })
      }
    }
  }
</script>
