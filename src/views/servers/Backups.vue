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
    class="pa-3"
    :loading="fetching"
  >
    <v-list v-if="items.length>0">
      <v-list-item-group>
        <template v-for="(item, i) in items">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
            @click="download(item)"
          >
            <template v-slot:default>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{item.size | prettyBytes }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  icon
                  @click="deleteBackup(item.name)"
                  @click.stop
                >
                  <v-icon small>delete</v-icon>
                </v-btn>
              </v-list-item-action>

            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>

    <v-card-text v-else>
      Empty
    </v-card-text>

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
        loading: false,
        fetching: false,
        serverId: 0
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
 
        api.get('servers/' + this.serverId + '/backups')
        .then(function (response) {
          console.log(response)
          self.data = response.data.item
          self.items = response.data.items

          document.title = 'Backups' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      deleteBackup(item) {
        this.$confirm('Delete ' + item).then(res => {
          if (!res) {
            return
          }
          
          var self = this
          self.fetching = true

          api.post('servers/' + this.serverId + '/backups', {ids: [item]})
          .then(function () {
              self.fetchData()
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
        })
      },
      download(item) {
        window.open('http://' + this.data.ip + '/backups/' + item.name)
      }
    }
  }
</script>
