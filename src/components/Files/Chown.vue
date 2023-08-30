<template>
  <div v-if="selected.length">
    <v-btn @click="chown()" :disabled="!selected" title="Change owner">
      <v-icon>mdi:mdi-account</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog" width="unset">
      <v-card :loading="fetching" flat>
        <v-card-title> File ownership </v-card-title>

        <v-card-text>

          <v-autocomplete
            v-model="data.owner"
            label="Owner"
            :items="users"
            autofocus
            hide-details          
          ></v-autocomplete>

          <v-autocomplete
            v-model="data.group"
            label="Group"
            :items="groups"
            autofocus
            hide-details          
          ></v-autocomplete>

          <v-checkbox
            v-if="folderSelected"
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
    folderSelected: null,
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
        recursive: false,
      },
      groups: [],
      users: [],
      error: "",
      dialog: false,
    };
  },

  methods: {
    chown() {
      this.dialog = true;

      var self = this;

      api
        .get("servers/" + this.serverId + "/usersAndGroups")
        .then(response => {          
            self.groups = response.data.groups;
            self.users = response.data.users;
        });

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
      this.selected.forEach(element => files.push(element.id));

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'chown',
          owner: this.data.owner,
          group: this.data.group,
          recursive: this.data.recursive,
          files: files,
        })
        .then(response => {
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
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          self.fetching = false;
        });
    },
  },
};
</script>