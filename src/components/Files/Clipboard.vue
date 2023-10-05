<template>
  <div>
    <v-btn v-if="selected.length" @click="cut()" title="Cut" icon="mdi:mdi-content-cut"></v-btn>
    <v-btn v-if="selected.length" @click="copy()" title="Copy" icon="mdi:mdi-content-copy">    </v-btn>
    <v-btn v-if="data.items.length && path != data.src" @click="paste()" title="Paste" icon="mdi:mdi-content-paste">    </v-btn>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Confirm from "../ConfirmDialog.vue";

export default {
  components: {
    Confirm
  },

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

    paste: async function() {
      console.log(this.data);

      var cmd = this.data.cut ? "Move" : "Copy";

      if (
        await this.$refs.confirm.open(
          "Confirm",
          cmd + " " + this.data.items.length + " items?"
        )
      ) {
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
    },
  },
};
</script>