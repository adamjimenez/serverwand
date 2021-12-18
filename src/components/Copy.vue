<template>
  <span ref="container">
    <v-tooltip top v-if="text">
      <template v-slot:activator="{ on }">
        <span v-on="on" @click="copy(val)" @mouseleave="resetCopyText()">
          {{ val }}
        </span>
      </template>
      <span>{{ copyText }}</span>
    </v-tooltip>

    <v-tooltip top v-else>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon @click="copy(val)" @mouseleave="resetCopyText()">
          <v-icon small>file_copy</v-icon>
        </v-btn>
      </template>
      <span>{{ copyText }}</span>
    </v-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    val: null,
    text: Boolean,
  },
  data() {
    return {
      copyText: "Copy",
    };
  },
  methods: {
    copy(text) {
      var el = document.createElement("textarea");
      this.$refs["container"].appendChild(el);
      el.setAttribute("id", "clipboard");
      el.value = text;
      el.select();
      document.execCommand("Copy");
      el.parentNode.removeChild(el);
      this.copyText = "Copied";
    },
    resetCopyText() {
      var self = this;
      setTimeout(function () {
        self.copyText = "Copy";
      }, 500);
    },
  },
};
</script>