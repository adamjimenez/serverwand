<template>
    <span>

        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn
                    v-on="on"
                    icon
                    @click="edit(val)"
                >
                <v-icon small>create</v-icon>
                </v-btn>
            </template>
            <span>Edit</span>
        </v-tooltip>

        <v-dialog
            app
            v-model="dialog"
        >
            <v-card>
                <v-card-title>
                    Edit {{label}}
                </v-card-title>

                <v-card-text>
                    
                  <v-text-field
                      v-model="data.val"
                      :label="label"
                      autofocus
                      :type = "password || showPassword ? 'text' : 'password'"
                      :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                      @click:append="showPassword = !showPassword"
                  ></v-text-field>

                  <v-btn
                      color="primary"
                      @click="save"
                  >
                      Save
                  </v-btn>

                </v-card-text>
            </v-card>
        </v-dialog>

    </span>
</template>

<script>
  import api from '../services/api'

  export default {
    props: {
      name: null,
      val: null,
      label: null,
      password: null,
      path: null
    },
    data () {
      return {
          dialog: false,
          data: {
            val: null
          },
          showPassword: false
      }
    },
    created () {
        this.data.val = this.val
    },
    methods: {
      edit() {
        this.dialog = true
      },
      save() {
        this.fetching = true
        this.error = ''

        var data = {}
        data[this.name] = this.data.val

        var self = this
        api.post(this.path, data)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
        })
      }
    }
  }
</script>