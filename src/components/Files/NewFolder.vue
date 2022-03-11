<template>
  <div>
    <v-btn @click="open()" title="New folder"> <v-icon>mdi-folder-outline</v-icon>  </v-btn>
    <v-dialog app v-model="dialog">
      <v-card :loading="fetching">
        <v-card-title> New folder </v-card-title>

        <v-card-text>
          <v-text-field v-model="data.value" label="name" autofocus></v-text-field>

          <v-btn color="primary" @click="save" :disabled="data.value === ''">
            Save
          </v-btn>
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
  },

  watch: {
    path: function (newVal) {
      this.data.path = newVal
    },
  },

  data() {
    return {
      fetching: false,
      dialog: false,
      data: {
        value: ""
      },
    };
  },

  created() {
    this.data.path = this.path
  },

  methods: {
    open() {
      this.data.value = ""
      this.dialog = true
    },
    save() {
      var self = this
      this.error = ""
      this.fetching = true
      this.loading = true

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'new_folder',
          new_folder: this.data.value,
          path: this.data.path
        })
        .then(function (response) {
          console.log(response)

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
          self.fetching = false
          self.loading = false
        })
    },
  },
};
</script>