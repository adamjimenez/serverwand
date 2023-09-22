<template>
  <div>
    <v-alert v-if="dragover" type="info" style="position: fixed; height: 80px; z-index: 10; bottom: 0; left: 50%">
      Drop files to upload them to:
      <p>
        <strong>{{ path }}</strong>
      </p>
    </v-alert>

    <v-alert v-if="progress > 0" dark
      style="position: fixed; width: 100%; z-index: 10; left: 0; bottom: 0; margin: 0 auto;">
      <v-progress-linear v-model="progress" height="25">
        <template v-slot:default="{ value }">
          <strong>Uploading {{ fileName }}</strong>
        </template>
      </v-progress-linear>
    </v-alert>

    <v-btn title="Upload file" ref="uploadFileButton" icon>
      <v-icon>mdi:mdi-upload</v-icon>
    </v-btn>
    <v-btn v-if="folder" title="Upload folder" ref="uploadFolderButton" icon>
      <v-icon>mdi:mdi-folder-arrow-up</v-icon>
    </v-btn>

  </div>
</template>

<script>
import Resumable from "resumablejs";

export default {
  props: {
    serverId: null,
    path: null,
    dropZone: null,
    folder: null
  },

  watch: {
    path: function (newVal) {
      this.data.path = newVal;
    },
    folder: function () {
      this.folder = true;
    },
    serverId: function () {
      this.initUpload();
    },
    dropZone: function () {
      this.initUpload();
    }
  },

  mounted() {
    this.initUpload();
  },

  data() {
    return {
      fetching: false,
      data: {},
      error: "",
      dialog: false,
      r: null,
      dragover: false,
      progress: 0,
      fileName: ''
    };
  },

  methods: {
    initUpload() {
      if (!this.dropZone) {
        return;
      }

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

      if (this.$refs.uploadFolderButton) {
        this.r.assignBrowse(this.$refs.uploadFolderButton.$el, true);
      }

      this.r.on("fileAdded", function () {
        self.error = "";
        this.opts.query.path = self.path;
        this.upload();
      });

      this.r.on("fileProgress", file => {
        //console.log(file);

        var perc = parseInt(self.r.progress() * 100);

        self.progress = perc;
        self.fileName = file.fileName;
        self.dragover = false;
      });

      this.r.on("fileSuccess", (file, message) => {
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

      this.r.on("error", message => self.$emit("error", message));
      this.r.assignDrop(this.dropZone.$el);

      // handle dragover
      var enterTarget = null;
      this.dropZone.$el.addEventListener("dragenter", (e) => {
        [2];
        console.log('dragenter');

        e.preventDefault();
        enterTarget = e.target;
        self.dragover = true;
      });
      this.dropZone.$el.addEventListener("dragleave", (e) => {
        [2];
        if (enterTarget == e.target) {
          console.log('dragleave');
          e.preventDefault();
          self.dragover = false;
        }
      });
    }
  }

};
</script>