<template>
  <div v-if="selected.length">
    <v-btn @click="restore()" title="Restore" icon>
      <v-icon>mdi:mdi-restore</v-icon>
    </v-btn>
  </div>
  <Confirm ref="confirm" />
</template>

<script>
import api from "../../services/api";
import Confirm from "../ConfirmDialog.vue";

export default {
  components: {
    Confirm,
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
      data: {},
      error: "",
      dialog: false,
    };
  },

  methods: {
    restore: async function() {
      if (
        await this.$refs.confirm.open(
          "Confirm",
          'Restore selected files?'
        )
      ) {
        var self = this;
        this.fetching = true;

        var files = [];
        this.selected.forEach((element) => {
          files.push(element.name);
        });

        api
          .post("servers/" + this.serverId + "/backups", {
            cmd: 'restore',
            path: this.path,
            files: files,
          })
          .then(response => {
            console.log(response);

            if (response.data.success) {
              self.$emit("complete", response.data.result);
            } else {
              var error = response.data.error
                ? response.data.error
                : response.data;

              self.$emit("error", error);
            }
          })
          .catch(error => console.log(error))
          .finally(() => self.fetching = false);
      }
    },
  },
};
</script>