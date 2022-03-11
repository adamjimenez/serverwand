<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-dialog app v-model="dialog">
      <v-card :loading="fetching">
        <v-card-title> {{ data.file }} </v-card-title>

        <v-card-text>
          <MonacoEditor
            class="editor"
            ref="editor"
            v-model="data.content"
            theme="vs-dark"
            :options="{ automaticLayout: true }"
            @editorDidMount="setLanguage"
          />

          <v-btn color="primary" @click="saveFile"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../../services/api";
import MonacoEditor from "vue-monaco";

export default {
  components: {
    MonacoEditor,
  },

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
    dialog: function (value) {
      if (value === false) {
        // clear models
        window.monaco.editor.getModels().forEach((model) => model.dispose());
        // this.$refs.editor.getEditor().dispose()
      }
    },
  },

  data() {
    return {
      fetching: false,
      data: {
        recursive: false,
      },
      error: "",
      dialog: false,
    };
  },

  methods: {
    setLanguage() {
      if (!this.$refs.editor) {
        return;
      }

      var editor = this.$refs.editor.getEditor();

      const model = window.monaco.editor.createModel(
        this.data.content,
        undefined, // language
        window.monaco.Uri.file(this.data.file) // uri
      );

      editor.setModel(model);
    },
    open(item) {
      var self = this;

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'get',
          path: this.path,
          file: item.name,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.content !== false) {
            self.data.file = item.name;
            self.data.content = response.data.content;
            self.dialog = true;

            // set language
            self.setLanguage();
          } else {
            self.$emit("error", response.data.error);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    saveFile() {
      var self = this;
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'put',
          path: this.path,
          file: this.data.file,
          content: this.data.content,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.success) {
            self.dialog = false;
            self.$emit("complete");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>