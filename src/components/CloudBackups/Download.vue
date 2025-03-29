<template>
  <div  v-if="selected?.length === 1 && selected[0].type === 'file'">
    <v-btn @click="download()" title="Download" icon :loading="fetching">
        <v-icon>mdi:mdi-download</v-icon>
    </v-btn>
  </div>
</template>

<script>
import api from "../../services/api";
import util from "../../services/util";

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
      data: {},
      error: "",
      dialog: false,
    };
  },

  methods: {
    download: async function () {
        this.$emit("loading", true);

        let file = this.selected[0];
            console.log(file);
            console.log(this.selected);

        return api
        .post("servers/" + this.serverId + "/backups", {
            cmd: 'get',
            id: file.id,
        })
        .then(response => {
            util.download(response.data.content, file.id);
        })
        .catch(error => console.log(error))
        .finally(() => {
            this.fetching = false;
            this.$emit("loading", false);
        });
    }
  },
};
</script>