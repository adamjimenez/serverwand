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

          <v-btn color="primary" @click="saveFile" v-if="save !== 'false'"> Save </v-btn>
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
    action: null,
    save: null
  },

  watch: {
    path: function (newVal) {
      this.data.path = newVal;
    },
    selected: function (newVal) {
      this.data.selected = newVal;
    },
    dialog: function (value) {
      // clear models
      if (value === false) 
        window.monaco.editor.getModels().forEach(model => model.dispose());
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

      this.$emit("loading", true);
      api
        .post("servers/" + this.serverId + "/" + this.action, {
          cmd: 'get',
          id: item.id,
        })
        .then(response => {
          console.log(response);

          if (response.data.success !== false) {
            self.data.id = item.id;
            self.data.file = item.name;
            self.data.content = response.data.content;
            self.dialog = true;

            // set language
            self.setLanguage();
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
            self.dialog = false;
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
  },
};
</script>