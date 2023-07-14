<template>
  <div v-if="selected.length === 1 && selected[0].type === 'file'">
    <v-btn @click="download()" title="Download">
      <v-icon>mdi:mdi-download</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    serverId: null,
    path: null,
    selected: null,
  },

  watch: {
    path: newVal => this.data.path = newVal,
    selected: newVal => this.data.selected = newVal,
  },

  data() {
    return {
      fetching: false,
      data: {},
      error: "",
      dialog: false,
    };
  },

  methods: {
    download() {
      window.open(
        "https://serverwand.com/api/servers/" +
          this.serverId +
          "/files?d=" +
          encodeURIComponent(this.selected[0].id)
      );
    },
  },
};
</script>