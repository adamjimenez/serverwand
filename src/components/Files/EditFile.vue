<template>
  <span>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-dialog v-model="dialog">
      <v-card :loading="fetching" style="height: 95vh;">

        <v-toolbar :title="data.id">
          <template v-slot:append>
            <v-btn @click="saveFile" v-if="save !== 'false'" fab icon="mdi:mdi-content-save"></v-btn>
          </template>
        </v-toolbar>

        <v-card-text>
          <MonacoEditor
            class="editor"
            ref="editor"
            :language="language"
            v-model:value="data.content"
            theme="vs-dark"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../../services/api";
import MonacoEditor from "monaco-editor-vue3";

export default {
  components: {
    MonacoEditor,
  },

  props: {
    serverId: null,
    action: null,
    save: null
  },

  watch: {
    dialog: function (value) {
      // clear models
      if (value === false) {
        //window.monaco.editor.getModels().forEach(model => model.dispose());
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
      language: 'javascript'
    };
  },

  methods: {
    basename(path) {
      return path.split(/[\\/]/).pop();
    },
    getEditor() {
      return this.$refs.editor.editor;
    },
    open(item) {
      var self = this;

      this.$emit("loading", true);

      console.log(item.id);
      
      return api
        .post("servers/" + this.serverId + "/" + this.action, {
          cmd: 'get',
          id: item.id,
        })
        .then(response => {
          console.log(response);

          if (response.data.success !== false) {
            self.data.id = item.id;
            self.data.file = self.basename(item.id);
            self.data.content = response.data.content;
            self.dialog = true;

            // set language
            //self.setLanguage();
          } else {
            self.$emit("error", response.data.error);
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          self.fetching = false;
          self.$emit("loading", false);
        });
    },
    saveFile() {
      var self = this;
      this.fetching = true;

      this.$emit("loading", true);
      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'put',
          id: this.data.id,
          content: this.data.content,
        })
        .then(response => {
          console.log(response);

          if (response.data.success) {
            self.$emit("complete");
          } else {
            self.$emit("error", response.data.error);
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          self.fetching = false;          
          self.$emit("loading", false);
        });
    },
    goToLine(line) {
      line = parseInt(line);
      var editor = this.getEditor()
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.revealLineInCenter(line);
      editor.focus();
    }
  },
};
</script>