<template>
  <span>
    <v-tooltip location="top">
        <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                icon
                @click="upgrade()"
            >
            <v-icon small>fas fa-download</v-icon>
            </v-btn>
        </template>
        <span>Upgrade</span>
    </v-tooltip>
  </span>
</template>

<script>
  export default {
    data () {
      return {
      }
    },

    methods: {
      upgrade() {
        var url =
          "http://shiftedit.net/ssh/?host=" +
          window.server.hostname +
          "&user=" +
          window.server.ssh_username +
          '&cmd=sudo%20apt-get%20upgrade%20-y';

        window.open(url);
      }
    }
  }
</script>