<template>
  <span ref="container">
    <v-tooltip :text="copyText" top v-if="text">
      <template v-slot:activator="{ props }">
        <span v-bind="props" @click="copy(val)" @mouseleave="resetCopyText">
          {{ val }}
        </span>
      </template>
    </v-tooltip>

    <v-tooltip :text="copyText" top v-else>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon @click="copy(val)" @mouseleave="resetCopyText">
          <v-icon size="small">mdi:mdi-content-copy</v-icon>
        </v-btn>
      </template>
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
      setTimeout(() => self.copyText = "Copy", 500);
    },
  },
};
</script>