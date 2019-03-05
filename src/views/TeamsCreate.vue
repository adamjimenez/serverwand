<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert> 

    <Loading :value="loading" />

    <v-subheader>
      <h1>Team details</h1>
    </v-subheader>

    <v-form
      v-if="!loading"
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-card>
        <v-card-text>

          <v-text-field
            v-model="data.name"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>

          <v-btn
            :disabled="loading"
            :loading="loading"
            color="success"
            @click="validate"
          >
            Save
          </v-btn>

        </v-card-text>
      </v-card>
    </v-form>
  </div>
</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'

  export default {
    components: {
      Loading
    },
    data: () => ({
      loading: false,
      valid: true,
      data: {
        name: '',
      },
      nameRules: [
        v => !!v || 'Name is required'
      ],
      details: "",
      serverId: 0,
      error: ''
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.id = this.$route.params.id
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = true

        api.get('teams/' + this.id)
        .then(function (response) {
          console.log(response)

          if (self.id) {
            self.data.name = response.data.item.name
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      validate () {
        var self = this

        if (this.$refs.form.validate()) {
            this.details = ''
            this.loading = true          
          
            api.post('teams/' + self.id, this.data)
            .then(function (response) {
                console.log(response)
                if (response.data.id) {
                  self.$router.push('/teams/' + response.data.id + '/members')
                } else if (response.data.error) {
                  self.error = response.data.error
                }
            })
            .catch(function (error) {
              console.log(error)
            }).finally(function () {
              self.loading = false
            })
        }
      }
    }
  }
</script>