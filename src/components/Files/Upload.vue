<template>
  <v-col class="flex-grow-0" style="min-width: 176px">
    <v-row>
      <v-col class="flex-grow-0">
        <v-btn title="Upload file" ref="uploadFileButton">
          <v-icon>upload</v-icon>
        </v-btn>
      </v-col>
      <v-col class="flex-grow-0">
        <v-btn title="Upload folder" ref="uploadFolderButton">
          <v-icon>drive_folder_upload</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import Resumable from "resumablejs";

export default {
  props: {
    serverId: null,
    path: null,
    results: null,
  },

  watch: {
    path: function (newVal) {
      this.data.path = newVal;
    },
    results: function (results) {
      this.r.assignDrop(results.$el);
    },
  },

  data() {
    return {
      fetching: false,
      data: {},
      error: "",
      dialog: false,
      r: null,
    };
  },

  mounted() {
    var self = this;

    this.r = new Resumable({
      target: "https://serverwand.com/api/servers/" + this.serverId + "/files",
      testChunks: false,
      query: {
        cmd: "upload",
        chunked: 1,
      },
      withCredentials: true,
      chunkSize: 1 * 1024 * 1024,
    });

    this.r.assignBrowse(this.$refs.uploadFileButton.$el);
    this.r.assignBrowse(this.$refs.uploadFolderButton.$el, true);

    this.r.on("fileAdded", function () {
      self.error = "";
      this.opts.query.path = self.path;
      this.upload();
    });

    this.r.on("fileProgress", function (file) {
      console.log(file);

      var perc = parseInt(self.r.progress() * 100);
      self.$emit("progress", perc);
    });

    this.r.on("fileSuccess", function (file, message) {
      var data = JSON.parse(message);
      if (data.error) {
        self.error = data.error;
      }
    });

    this.r.on("complete", function () {
      //clear upload queue so you can upload the same file
      this.cancel();

      self.$emit("complete");

      if (self.error) {
        self.$emit("error", self.error);
      }
    });

    this.r.on("error", function (message) {
      self.$emit("error", message);
    });
  },

  methods: {},
};
</script>