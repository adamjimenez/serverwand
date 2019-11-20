<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <Loading :value="fetching" />

<template>
  <v-card
    class="mx-auto"
  >
    <v-list v-if="items.length>0">
      <v-list-item-group>
        <template v-for="(item, i) in items">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
          >
            <template v-slot:default="{ active, toggle }">
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{format(item.size)}}</v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>

    <v-card-text v-else>
      Empty
    </v-card-text>

  </v-card>
</template>

    <v-card>
        <div>
          <v-card-title primary-title>
            <v-btn
                @click="deleteBackup()"
                :disabled="!selected"
            >
                Delete
            </v-btn>
          </v-card-title>
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
      format: function(size) {
        if (size === '' || size === -1) {
          return ''
        }

        var si
        for(si = 0; size >= 1024; size /= 1024, si++) {}

        return '' + Math.round(size) + 'KMGT'.substr(si, 1)
      },
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
      deleteBackup() {
        var self = this
        self.fetching = true

        var ids = []
        this.items.forEach(element => {
            if (element.selected) {
                ids.push(element.name)
            }
        })

        api.post('servers/' + this.serverId + '/deletebackup', {ids: ids})
        .then(function () {
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
