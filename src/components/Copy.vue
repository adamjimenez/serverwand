<template>
  <span ref="container">
    <v-tooltip :text="copyText" top v-if="text">
      <template v-slot:activator="{ props }">
        <span v-bind="props" @click="copy(val)" @mouseleave="resetCopyText">
          {{ label ? label : val }}
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
    label: null,
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
      const el = document.createElement("textarea");
      this.$refs["container"].appendChild(el);
      el.setAttribute("id", "clipboard");
      el.value = text;
      el.select();
      document.execCommand("Copy");
      el.parentNode.removeChild(el);
      this.copyText = "Copied";
    },
    resetCopyText() {
      setTimeout(() => this.copyText = "Copy", 500);
    },
  },
};
</script>