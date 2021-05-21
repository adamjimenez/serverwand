<template>
  <span>

    <span v-if="yesno">
      {{ val ? 'Yes' : 'No' }}
    </span>

    <span v-else>
      {{ val }}
    </span>    

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
      <v-card
        :loading="fetching"
      >
        <v-card-title>
          Edit {{label}}
        </v-card-title>

        <v-card-text>
          
          <v-select
            v-if="yesno"
            v-model="data.val"
            :items="yesnoItems"
            :label="label"
            autofocus
          ></v-select>

          <v-text-field
            v-else
            v-model="data.val"
            :label="label"
            autofocus
            :type = "!password || showPassword ? 'text' : 'password'"
            :append-icon="!password ? '' : (showPassword ? 'visibility_off' : 'visibility')"
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
      password: Boolean,
      path: null,
      yesno: Boolean,
    },
    data () {
      return {
        fetching: false,
        dialog: false,
        data: {
          val: null
        },
        showPassword: false,
        yesnoItems: [{
          text: 'Yes',
          value: 1
        }, {
          text: 'No',
          value: 0
        }],
      }
    },
    created () {
      this.data.val = this.val
    },
    methods: {
      edit() {
        this.data.val = this.val
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
          if (!self.password) {
            self.val = self.data.val
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
          self.dialog = false
        })
      }
    }
  }
</script>