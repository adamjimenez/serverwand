<template>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          icon
          @click="copy(val)"
          @mouseleave="resetCopyText()"
        >
          <v-icon small>file_copy</v-icon>
        </v-btn>
      </template>
      <span>{{ copyText }}</span>
    </v-tooltip>
</template>

<script>
  export default {
    props: {
      val: null
    },
    data () {
      return {
        copyText: 'Copy'
      }
    },
    methods: {
      copy(text) {
        var self = this
        var el = document.createElement("textarea")
        document.body.appendChild(el)
        el.setAttribute('id', 'clipboard')
        el.value = text
        el.select()
        document.execCommand("Copy")
        el.parentNode.removeChild(el)
        
        self.copyText = 'Copied'
      },
      resetCopyText() {
        var self = this
        setTimeout(function() {
          self.copyText = 'Copy'
        }, 500)
      },
    }
  }
</script>