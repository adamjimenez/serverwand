<template>
  <div>
    <v-btn @click="newSnapshot" title="Create snapshot" icon>
      <v-icon>mdi:mdi-cloud-upload</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog">
      <v-card :loading="fetching">
        <v-card-title> Snapshot </v-card-title>

        <v-card-text>
          <v-text-field v-model="name" label="Name" autofocus></v-text-field>

          <v-btn color="primary" @click="createSnapshot" :disabled="name.length === 0">
            Create snapshot
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog app scrollable persistent v-model="showMessage">
      <v-card :loading="fetching">
        <v-card-title> Response </v-card-title>

        <v-card-text id="messageBody">
          <v-textarea :value="message" readonly auto-grow :loading="fetching"></v-textarea>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="
            $emit('closed');
          showMessage = false;
          " :disabled="fetching">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import api from "../../services/api";

export default {
  props: {
    serverId: null,
  },

  data() {
    return {
      message: "",
      fetching: false,
      name: "",
      dialog: false,
      showMessage: false,
    };
  },

  methods: {
    newSnapshot() {
      this.dialog = true;
    },

    createSnapshot() {
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups", {
          cmd: 'snapshot',
          name: this.name
        })
        .then(response => {
          console.log(response);

          this.dialog = false;

          if (response.data.success) {
            this.$emit("complete", response.data.result);
          } else {
            let error = response.data.error
              ? response.data.error
              : response.data;

            this.$emit("error", error);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => this.fetching = false);

    }
  },
};
</script>