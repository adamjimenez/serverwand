<template>
  <div v-if="selected.length">
    <v-btn @click="deleteItem()" title="Delete" icon>
      <v-icon>mdi:mdi-delete</v-icon>
    </v-btn>
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
    },
  },

  data() {
    return {
      fetching: false,
      error: "",
      data: {},
    };
  },

  methods: {
    deleteItem: async function () {
      if (!await this.$refs.confirm.open("Delete selected files?")) {
        return;
      }
      
      var self = this;
      this.fetching = true;

      var files = [];
      this.selected.forEach(element => files.push(element.id));

      api
        .post("servers/" + this.serverId + "/files", {
          cmd: 'delete',
          files: files,
        })
        .then(response => {
          console.log(response);

          if (response.data.success) {
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
        .finally(() => self.fetching = false);
    }
  },
}

</script>