<template>
  <div v-if="selected.length">
    <v-btn @click="chmod()" :disabled="!selected" title="Change permissions" icon="mdi:mdi-file-key-outline"></v-btn>

    <v-dialog app v-model="dialog" width="600">
      <v-card :loading="fetching" flat title="File permissions">
        <v-card-text>
          <v-container fluid>
            <div>Owner</div>
            <v-row>
              <v-col>
                <v-checkbox v-model="ownerR" label="Read" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="ownerW" label="Write" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="ownerE" label="Execute" @change="calcMode()"></v-checkbox>
              </v-col>
            </v-row>
            <div class="mt-5">Group</div>
            <v-row>
              <v-col>
                <v-checkbox v-model="groupR" label="Read" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="groupW" label="Write" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="groupE" label="Execute" @change="calcMode()"></v-checkbox>
              </v-col>
            </v-row>
            <div class="mt-5">Public</div>
            <v-row>
              <v-col>
                <v-checkbox v-model="publicR" label="Read" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="publicW" label="Write" @change="calcMode()"></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox v-model="publicE" label="Execute" @change="calcMode()"></v-checkbox>
              </v-col>
            </v-row>
          </v-container>

          <v-form v-model="valid">
            <v-text-field v-model="data.mode" label="mode" autofocus @keyup="modeToCheckboxes()"
              :rules="[rules.required, rules.perms]"></v-text-field>

            <v-checkbox v-if="folderSelected" v-model="data.recursive" label="Replace child permissions"></v-checkbox>

            <v-btn color="primary" @click="doChmod()" :disabled="!valid">Save</v-btn>
          </v-form>
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
      error: "",
      dialog: false,
      ownerR: false,
      ownerW: false,
      ownerE: false,
      groupR: false,
      groupW: false,
      groupE: false,
      publicR: false,
      publicW: false,
      publicE: false,

      rules: {
        required: (value) => !!value || "Required.",
        perms: (v) =>
          !v ||
          /^([0-7][0-7][0-7])$/.test(
            v
          ) ||
          "Invalid Permissions",
      },
      valid: null,
    };
  },

  methods: {
    calcMode() {
      let owner = 0,
        pub = 0,
        group = 0;

      if (this.ownerR) owner += 4;
      if (this.ownerW) owner += 2;
      if (this.ownerE) owner += 1;

      if (this.groupR) group += 4;
      if (this.groupW) group += 2;
      if (this.groupE) group += 1;

      if (this.publicR) pub += 4;
      if (this.publicW) pub += 2;
      if (this.publicE) pub += 1;

      this.data.mode = "" + owner + group + pub;
    },
    modeToCheckboxes() {
      let perms = this.data.mode;
      let owner = perms.substr(0, 1);
      let group = perms.substr(1, 1);
      let pub = perms.substr(2, 1);

      this.ownerR = owner >= 4 && owner <= 7;
      this.ownerW = owner == 2 || owner == 3 || owner == 6 || owner == 7;
      this.ownerE = owner == 1 || owner == 3 || owner == 5 || owner == 7;
      this.groupR = group >= 4 && group <= 7;
      this.groupW = group == 2 || group == 3 || group == 6 || group == 7;
      this.groupE = group == 1 || group == 3 || group == 5 || group == 7;
      this.publicR = pub >= 4 && pub <= 7;
      this.publicW = pub == 2 || pub == 3 || pub == 6 || pub == 7;
      this.publicE = pub == 1 || pub == 3 || pub == 5 || pub == 7;
    },
    chmod() {
      this.dialog = true;

      if (this.selected.length === 1) {
        this.data.mode = this.selected[0].permsn;
      } else {
        this.data.mode = "000";
      }

      this.modeToCheckboxes();
    },
    doChmod() {
      this.fetching = true;

      let files = [];
      this.selected.forEach(element => files.push(element.id));

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'chmod',
          mode: this.data.mode,
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
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>