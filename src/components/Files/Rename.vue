<template>
  <div v-if="selected.length === 1">
    <v-btn @click="rename()" :disabled="!selected" title="Rename" icon>
      <v-icon>mdi:mdi-rename-box</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog" max-width="600">
      <v-card :loading="fetching" title="Rename">

        <v-card-text>
          <v-text-field
            v-model="data.newName"
            label="name"
            autofocus
          ></v-text-field>

          <v-btn color="primary" @click="doRename"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
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
      fetching: false,
      data: {
        path: '',
        selected: []
      },
      error: "",
      dialog: false,
    };
  },

  methods: {
    rename() {
      console.log(this.selected)
      this.dialog = true;
      this.data.oldName = this.selected[0].name;
      this.data.newName = this.selected[0].name;
    },
    doRename() {
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'rename',
          path: this.path,
          old_name: this.data.oldName,
          new_name: this.data.newName,
        })
        .then(response => {
          console.log(response);

          if (response.data.success) {
            this.dialog = false;
            this.$emit("complete");
          } else {
            let error = response.data.error
              ? response.data.error
              : response.data;

              this.$emit("error", error);
          }
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>