<template>
  <v-col
    class="flex-grow-0"
    v-if="selected.length === 1 && fileExtension(selected[0].name) === 'zip'"
  >
    <v-btn @click="extract()" :disabled="!selected" title="Extract">
      <v-icon>mdi-folder-zip-outline</v-icon>
    </v-btn>
  </v-col>
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
    },
  },

  data() {
    return {
      data: {
        recursive: false,
      },
      error: "",
      dialog: false,
    };
  },

  methods: {
    fileExtension(filename) {
      var dot = filename.lastIndexOf(".");
      return dot === -1 ? "" : filename.substr(dot + 1, filename.length);
    },

    extract() {
      var self = this;
      this.$emit("loading", true);

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: "extract",
          path: this.path,
          file: this.selected[0].name,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.success) {
            self.dialog = false;
            self.$emit("complete");
          } else {
            var error = response.data.error
              ? response.data.error
              : response.data;

            self.$emit("error", error);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          this.$emit("loading", false);
        });
    },
  },
};
</script>