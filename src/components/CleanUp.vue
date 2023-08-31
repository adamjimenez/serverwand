<template>
  <span>
    <v-btn icon @click="clean()">
      <v-icon small>fas fa-broom</v-icon>
    </v-btn>

    <v-dialog app scrollable v-model="showClean">
      <v-card :loading="fetching" title="Clean files" :subtitle="prettyBytes(sumSize(selected)) + ' to be removed'">

        <v-card-text>
          <v-data-table v-model="selectedIds" :headers="headers" :items="items" item-key="file" show-select
            items-per-page="-1">
            <template v-slot:item.size="{ item }">
              <div v-if="item.raw.size > 0">
                {{ prettyBytes(item.raw.size) }}
              </div>
            </template>
            <template #bottom></template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="doClean()" :disabled="selected.length === 0">
            Remove
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="
            $emit('closed');
          showClean = false;
          ">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../services/api";
import util from "../services/util";

export default {
  props: {
    serverId: null,
  },
  data() {
    return {
      fetching: false,
      cleanSize: 0,
      showClean: false,
      selectedIds: [],
      headers: [
        { title: "File", key: "id" },
        { title: "Size", key: "size" },
      ],
      items: [],
    };
  },

  computed: {
    selected: function () {
      let selected = [];

      var self = this;
      this.selectedIds.forEach(function (id) {
        selected.push(self.items.find(obj => obj.id === id))
      });

      return selected;
    }
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
          self.items = response.data.files;
          self.cleanSize = response.data.size;
          self.fetching = false;

          self.selectedIds = [];
          self.items.forEach(function (item) {
            self.selectedIds.push(item.id);
          });
        });
    },

    doClean() {
      var self = this;
      this.fetching = true;

      var files = [];
      this.selected.forEach(item => files.push(item.id));

      api
        .post("servers/" + this.serverId + "/clean", { files: files })
        .then(() => self.clean());
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>