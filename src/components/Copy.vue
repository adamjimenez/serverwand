<template>
    <v-tooltip top>
        <v-btn
        icon
        slot="activator"
        color="primary"
        @click="copy(val)"
        @mouseleave="resetCopyText()"
        >
        <v-icon>file_copy</v-icon>
        </v-btn>
        
        <span>{{ copyText }}</span>
    </v-tooltip>
</template>

<script>
  export default {
    props: {
        val: ''
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
        el.focus()
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