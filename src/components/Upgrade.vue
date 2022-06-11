<template>
  <span>

    <v-tooltip top>
        <template v-slot:activator="{ on }">
            <v-btn                            
                v-on="on"
                icon
                @click="upgrade()"
            >
            <v-icon small>fas fa-download</v-icon>
            </v-btn>
        </template>
        <span>Upgrade</span>
    </v-tooltip>

    <v-dialog
      app
      scrollable
      persistent
      v-model="showMessage"
    >
      <v-card :loading="fetching">
          <v-card-title>
            Response
          </v-card-title>

          <v-card-text id="messageBody">
            
            <v-textarea
              :value="message"
              readonly
              auto-grow
              :loading="loading"
            ></v-textarea>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="$emit('closed'); showMessage = false"
              :disabled="loading"
            >
              Close
            </v-btn>
          </v-card-actions>

      </v-card>
    </v-dialog>

  </span>
</template>

<script>
  import api from '../services/api'

  export default {
    props: {
      serverId: null
    },
    data () {
      return {
        message: '',
        showMessage: false,
        loading: true,
        fetching: false,
        drawer: false
      }
    },

    methods: {

      upgrade() {
        var self = this
        this.error = ''
        this.showMessage = true
        this.loading = true
        this.message = ''

        api.event(
          'servers/' + this.serverId + '/upgrade',
          result => {
            self.message += result.msg + "\n"

            // scroll to bottom
            setTimeout(function() {
              var el = document.getElementById('messageBody')
              el.scrollTop = el.scrollHeight
            }, 10)
          },
          error => self.error = error,
          () => self.loading = false
        );

      },

    }
  }
</script>