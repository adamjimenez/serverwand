<template>
    <v-autocomplete
    v-model="model"
    :items="items"
    label="Search"
    persistent-hint
    @change="goto"
    @input="afterselection" 
    ref="autocomplete"
    >
    </v-autocomplete>
</template>

<script>
  import api from '../services/api';

  export default {
    data: () => ({
      model: null,
      items: []
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this;
        this.error = this.post = null
        this.loading = true
 
        api.domains()
        .then(function (response) {
          console.log(response)
          response.data.items.forEach(element => {
              self.items.push({
                  text: element.domain,
                  value: '/domains/' + element.id
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
      goto(to) {
        this.$router.push(to)
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