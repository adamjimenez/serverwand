<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <Loading :value="fetching" />

    <v-card>
        <v-list
          subheader
          two-line
          v-if="items.length"
        >
            <template v-for="(item, index) in items">
                <v-list-tile
                    @click=""
                    :key="item.id"                    
                >
                    <v-list-tile-action>
                        <v-checkbox v-model="item.selected"></v-checkbox>
                    </v-list-tile-action>

                    <v-list-tile-content @click="item.selected = !item.selected">
                        <v-list-tile-title>{{item.sender}} > {{item.recipient}}</v-list-tile-title>
                        <v-list-tile-sub-title>{{item.date}}</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
        </v-list>
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
        fetching: true,
        serverId: 0,
        selected: false
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

        api.post('servers/' + this.serverId + '/deletemessages', {ids: ids})
        .then(function (response) {
            self.fetchData()
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
        })
        .finally(function() {
        })
      }
    }
  }
</script>
