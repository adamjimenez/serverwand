<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon @click="clean()">
          <v-icon small>fas fa-broom</v-icon>
        </v-btn>
      </template>
      <span>Disk Clean Up</span>
    </v-tooltip>

    <v-dialog app scrollable v-model="showClean">
      <v-card :loading="fetching">
        <v-card-title> Clean files </v-card-title>
        <v-card-subtitle>
          {{ sumSize(selectedFiles) | prettyBytes }} to be removed
        </v-card-subtitle>

        <v-card-text>
          <v-data-table
            v-model="selectedFiles"
            :headers="cleanHeaders"
            :items="files"
            item-key="file"
            show-select
            class="elevation-1"
            disable-pagination
            :hide-default-footer="true"
          >
            <template v-slot:item.size="{ item }">
              <div v-if="item.size > 0">
                {{ item.size | prettyBytes }}
              </div>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="doClean()" :disabled="selectedFiles.length === 0">
            Remove
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              $emit('closed');
              showClean = false;
            "
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../services/api";

export default {
  props: {
    serverId: null,
  },
  data() {
    return {
      fetching: false,
      cleanSize: 0,
      showClean: false,
      selectedFiles: [],
      cleanHeaders: [
        { text: "File", value: "file" },
        { text: "Size", value: "size" },
      ],
      files: [],
    };
  },

  methods: {
    sumSize(files) {
      var total = 0;
      files.forEach((element) => {
        total += parseInt(element.size);
        //console.log(element.size)
      });

      return total;
    },

    clean() {
      var self = this;
      this.showClean = true;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/clean", { clearCacheEntry: true })
        .then(response => {
          self.files=response.data.files;
          self.cleanSize=response.data.size;
          self.fetching=false;
        });
  },

    doClean() {
      var self = this;
      this.fetching = true;

      var files = [];
      this.selectedFiles.forEach(item => files.push(item.file));

      api
        .post("servers/" + this.serverId + "/clean", { files: files })
        .then(() => self.clean());
    },
  },
};
</script>