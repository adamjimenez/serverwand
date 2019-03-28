<template>
    <v-autocomplete
      v-model="model"
      :items="items"
      label="Search"
      persistent-hint
      @input="afterselection" 
      ref="autocomplete"
    >
      <template
        slot="item"
        slot-scope="data"
      >
        <template v-if="typeof data.item !== 'object'">
          <v-list-tile-content v-text="data.item"></v-list-tile-content>
        </template>
        <template v-else>
          <v-list-tile-avatar>
            <v-icon>{{data.item.avatar}}</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content class="results">
            <router-link :to="data.item.value"> 
              <v-list-tile-title>{{data.item.text}}</v-list-tile-title>
              <v-list-tile-sub-title v-html="data.item.subtitle"></v-list-tile-sub-title>
            </router-link>
          </v-list-tile-content>
        </template>
      </template>
    </v-autocomplete>
</template>

<script>
  import api from '../services/api';

  export default {
    data: () => ({
      model: null,
      items: [],
      servers: []
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()

      this.$eventHub.$on('itemsChanged', this.fetchData);
    },

    methods: {
      fetchData () {        
        var self = this;
        this.error = this.post = null
        this.loading = true
 
        api.get('domains/')
        .then(function (response) {
          console.log(response)
          response.data.items.forEach(element => {
              self.items.push({
                  text: element.domain,
                  subtitle: self.servers[element.server],
                  value: '/domains/' + element.id + '/summary',
                  avatar: 'fas fa-globe'
              });
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
 
        api.get('servers/')
        .then(function (response) {
          console.log(response)
          response.data.items.forEach(element => {
              self.$set(self.servers, element.id, element.name)

              self.items.push({
                  text: element.name,
                  subtitle: element.hostname,
                  value: '/servers/' + element.id + '/summary',
                  avatar: 'fas fa-server'
              });
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      afterselection(item){
        this.$nextTick(() => {
          console.log(this)
          this.model = null           
          this.$refs.autocomplete.blur()
        })
      }
    }
  }
</script>

<style>
.results a {
  color: inherit !important;
}
</style>