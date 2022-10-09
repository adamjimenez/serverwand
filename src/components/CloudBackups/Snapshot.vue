<template>
  <div>
    <v-btn @click="newSnapshot" title="Create snapshot">
        <v-icon>backup</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog">
      <v-card :loading="fetching">
        <v-card-title> Snapshot </v-card-title>

        <v-card-text>
          <v-text-field v-model="name" label="Name" autofocus></v-text-field>

          <v-btn
            color="primary"
            @click="createSnapshot"
            :disabled="name.length === 0"
          >
            Create snapshot
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog app scrollable persistent v-model="showMessage">
      <v-card :loading="fetching">
        <v-card-title> Response </v-card-title>

        <v-card-text id="messageBody">
          <v-textarea
            :value="message"
            readonly
            auto-grow
            :loading="fetching"
          ></v-textarea>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              $emit('closed');
              showMessage = false;
            "
            :disabled="fetching"
          >
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
      this.$confirm("Create snapshot?").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;

          api
            .post("servers/" + this.serverId + "/backups", {
              cmd: 'snapshot',
              name: this.name
            })
            .then(response => {
                console.log(response);

                self.dialog=false;

                if(response.data.success) {
                  self.$emit("complete", response.data.result);
                } else {
                  var error=response.data.error
                    ? response.data.error
                    :response.data;

                  self.$emit("error", error);
                }
              })
            .catch((error) => console.log(error))
            .finally(() => self.fetching = false);

        }
      });
    },
  },
};
</script>