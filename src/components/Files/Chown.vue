<template>
  <div v-if="selected.length">
    <v-btn @click="chown()" :disabled="!selected" title="Change owner">
      <v-icon>mdi-account</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog" width="unset">
      <v-card :loading="fetching" flat>
        <v-card-title> File ownership </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="data.owner"
            label="Owner"
            autofocus
          ></v-text-field>

          <v-text-field v-model="data.group" label="Group"></v-text-field>

          <v-checkbox
            v-model="data.recursive"
            label="Replace child permissions"
          ></v-checkbox>

          <v-btn color="primary" @click="doChown()"> Save </v-btn>
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
    chown() {
      this.dialog = true;

      if (this.selected.length === 1) {
        this.data.owner = this.selected[0].owner;
        this.data.group = this.selected[0].group;
      } else {
        this.data.owner = "";
        this.data.group = "";
      }
    },
    doChown() {
      var self = this;
      this.fetching = true;

      var files = [];
      this.selected.forEach((element) => {
        files.push(element.name);
      });

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'chown',
          path: this.path,
          owner: this.data.owner,
          group: this.data.group,
          recursive: this.data.recursive,
          files: files,
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
          self.fetching = false;
        });
    },
  },
};
</script>