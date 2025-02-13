<template>
  <div>
    <v-btn v-if="selected.length" @click="cut()" title="Cut" icon="mdi:mdi-content-cut"></v-btn>
    <v-btn v-if="selected.length" @click="copy()" title="Copy" icon="mdi:mdi-content-copy"></v-btn>
    <v-btn v-if="data.items.length && (path != data.src || !data.cut)" @click="paste()" title="Paste"
      icon="mdi:mdi-content-paste"></v-btn>
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

    paste: async function () {
      console.log(this.data);

      let cmd = this.data.cut ? "Move" : "Copy";

      if (!await this.$refs.confirm.open(cmd + " " + this.data.items.length + " items?")) {
        return;
      }

      this.fetching = true;
      this.$emit('error', null);

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
            this.data.items = [];
          }

          if (response.data.success) {
            this.$emit("complete");
          } else {
            let error = response.data.error
              ? response.data.error
              : response.data;

            this.$emit('error', error);
          }
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
  },
};
</script>