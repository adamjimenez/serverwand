<template>
  <span>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-dialog v-model="dialog" fullscreen>
      <v-card :loading="fetching" style="height: 95vh;">

        <v-toolbar :title="data.id">
          <template v-slot:append>
            <v-btn @click="saveFile" v-if="save !== 'false'" fab icon="mdi:mdi-content-save"></v-btn>
            <v-btn @click="dialog = false" icon="mdi:mdi-close"></v-btn>
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
            this.data.id = item.id;
            this.data.file = this.basename(item.id);
            this.data.content = response.data.content;
            this.dialog = true;

            // set language
            //this.setLanguage();
          } else {
            this.$emit("error", response.data.error);
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.fetching = false;
          this.$emit("loading", false);
        });
    },
    saveFile() {
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
            this.$emit("complete");
          } else {
            this.$emit("error", response.data.error);
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;          
          this.$emit("loading", false);
        });
    },
    goToLine(line) {
      line = parseInt(line);
      let editor = this.getEditor()
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.revealLineInCenter(line);
      editor.focus();
    }
  },
};
</script>