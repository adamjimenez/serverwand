<template>
  <div v-if="selected.length">
    <v-btn @click="deleteItem()" title="Delete">
      <v-icon>delete</v-icon>
    </v-btn>
  </div>
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
    deleteItem() {
      this.$confirm("Delete selected files?").then((res) => {

        if (res) {
          var self = this;
          this.fetching = true;

          var files = [];
          this.selected.forEach((element) => {
            files.push(element.id);
          });

          api
            .post("servers/" + this.serverId + "/files", {
              cmd: 'delete',
              files: files,
            })
            .then(function (response) {
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
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.fetching = false;
            });
        }
      });
    },
  },
};
</script>