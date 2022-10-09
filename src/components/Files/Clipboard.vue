<template>
  <v-col class="flex-grow-0" style="min-width: 264px">
    <v-row>
      <v-col class="flex-grow-0" v-if="selected.length">
        <v-btn @click="cut()" title="Cut">
          <v-icon>content_cut</v-icon>
        </v-btn>
      </v-col>
      <v-col class="flex-grow-0" v-if="selected.length">
        <v-btn @click="copy()" title="Copy">
          <v-icon>file_copy</v-icon>
        </v-btn>
      </v-col>
      <v-col class="flex-grow-0" v-if="data.items.length && path != data.src">
        <v-btn @click="paste()" title="Paste">
          <v-icon>content_paste</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-col>
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
        items: [],
        cut: false,
        src: "",
      },
      error: "",
      dialog: false,
    };
  },

  methods: {
    cut() {
      this.copy(true);
    },

    copy(cut) {
      this.data.cut = cut ? true : false;
      this.data.src = this.path;
      this.data.items = [];
      this.selected.forEach(element => this.data.items.push(element.name));
    },

    paste() {
      console.log(this.data);

      var cmd = this.data.cut ? "Move" : "Copy";

      this.$confirm(cmd + " " + this.data.items.length + " items?").then(
        (res) => {
          if (res) {
            var self = this;
            this.fetching = true;

            api
              .post("servers/" + this.serverId + "/files", {
                cmd: cmd.toLowerCase(),
                path: this.path,
                src: this.data.src,
                files: this.data.items,
              })
              .then(response => {
                console.log(response);

                if (cmd.toLowerCase() === "move") {
                  self.data.items = [];
                }

                if (response.data.success) {
                  self.$emit("complete");
                } else {
                  var error = response.data.error
                    ? response.data.error
                    : response.data;
                    
                  self.$emit('error', error);
                }
              })
              .catch(error => console.log(error))
              .finally(() => self.fetching = false);
          }
        }
      );
    },
  },
};
</script>