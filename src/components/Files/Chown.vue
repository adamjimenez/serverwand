<template>
  <div v-if="selected.length">
    <v-btn @click="chown()" :disabled="!selected" title="Change owner" icon>
      <v-icon>mdi:mdi-account</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog" max-width="600">
      <v-card :loading="fetching" flat>
        <v-card-title> File ownership </v-card-title>

        <v-card-text>

          <v-autocomplete v-model="data.owner" label="Owner" :items="users" autofocus hide-details
            class="mb-5"></v-autocomplete>

          <v-autocomplete v-model="data.group" label="Group" :items="groups" hide-details class="mb-5"></v-autocomplete>

          <v-checkbox v-if="folderSelected" v-model="data.recursive" label="Replace child permissions"
            class="mb-5"></v-checkbox>

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

      api
        .get("servers/" + this.serverId + "/usersAndGroups")
        .then(response => {
          this.groups = response.data.groups;
          this.users = response.data.users;
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
      this.fetching = true;

      let files = [];
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
            this.dialog = false;
            this.$emit("complete");
          } else {
            let error = response.data.error
              ? response.data.error
              : response.data;

            this.$emit("error", error);
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
  },
};
</script>