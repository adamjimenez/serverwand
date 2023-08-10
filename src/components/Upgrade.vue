<template>
    <span>
      <v-tooltip location="top">
          <template v-slot:activator="{ props }">
              <v-btn
                  v-bind="props"
                  icon
                  @click="install()"
              >
              <v-icon small>fas fa-rocket</v-icon>
              </v-btn>
          </template>
          <span>Upgrade to {{ version }}</span>
      </v-tooltip>
    </span>
  </template>
  
  <script>
    export default {
      props: {
        version: null,
      },
      data () {
        return {
        }
      },
  
      methods: {
        install() {
          var url =
            "http://shiftedit.net/ssh/?host=" +
            window.server.hostname +
            "&user=" +
            window.server.ssh_username +
            '&cmd=sudo%20do-release-upgrade';
  
          window.open(url);
        }
      }
    }
  </script>