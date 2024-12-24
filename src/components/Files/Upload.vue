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
    folder: null,
    fileType: null,
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

      this.r = new Resumable({
        target: "https://serverwand.com/api/servers/" + this.serverId + "/files",
        testChunks: false,
        query: {
          cmd: "upload",
          chunked: 1,
        },
        withCredentials: true,
        chunkSize: 1 * 1024 * 1024,
        fileType: this.fileType,
      });

      this.r.assignBrowse(this.$refs.uploadFileButton.$el);

      if (this.$refs.uploadFolderButton) {
        this.r.assignBrowse(this.$refs.uploadFolderButton.$el, true);
      }

      let self = this;
      this.r.on("fileAdded", function () {
        self.error = "";
        this.opts.query.path = self.path;
        this.upload();
      });

      this.r.on("fileProgress", file => {
        let perc = parseInt(this.r.progress() * 100);

        this.progress = perc;
        this.fileName = file.fileName;
        this.dragover = false;
      });

      this.r.on("fileSuccess", (file, message) => {
        let data = JSON.parse(message);
        if (data.error) {
          this.error = data.error;
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

      this.r.on("error", message => this.$emit("error", message));
      this.r.assignDrop(this.dropZone.$el);

      // handle dragover
      let enterTarget = null;
      this.dropZone.$el.addEventListener("dragenter", (e) => {
        console.log('dragenter');

        e.preventDefault();
        enterTarget = e.target;
        this.dragover = true;
      });
      this.dropZone.$el.addEventListener("dragleave", (e) => {
        if (enterTarget == e.target) {
          console.log('dragleave');
          e.preventDefault();
          this.dragover = false;
        }
      });
    }
  }

};
</script>