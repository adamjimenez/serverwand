<template>
  <div>
    <v-alert v-if="msg" dark style="position: fixed; width: 100%; z-index: 10; left: 0; bottom: 0; margin: 0 auto;"
      type="info">
      {{ msg }}
    </v-alert>

    <v-btn @click="extract()" :disabled="!selected" title="Extract" icon
      v-if="selected?.length === 1 && ['zip', 'gz', 'tar'].indexOf(fileExtension(selected[0])) !== -1">
      <v-icon>mdi:mdi-folder-zip-outline</v-icon>
    </v-btn>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  props: {
    serverId: null,
    path: null,
    selected: null,
  },

  watch: {
    path: function (newVal) {
      this.data.path = newVal;
    },
    selected: function (newVal) {
      this.data.selected = newVal;
    }
  },

  data() {
    return {
      data: {
        recursive: false,
      },
      error: '',
      dialog: false,
      msg: ''
    };
  },

  methods: {
    fileExtension(file) {
      var dot = file.name.lastIndexOf(".");
      return dot === -1 ? "" : file.name.substr(dot + 1, file.name.length);
    },

    extract() {
      this.$emit("loading", true);

      api.event(
        'servers/' + this.serverId + '/files?cmd=extract&id=' + encodeURIComponent(this.selected[0].id),
        result => {
          this.msg = result.msg;
        },
        error => this.$emit("error", error),
        () => {
          this.msg = '';
          this.$emit("complete");
        }
      );

    },
  },
};
</script>