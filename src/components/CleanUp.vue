<template>
  <span>
    <v-btn icon @click="clean()" title="Disk Clean Up">
      <v-icon size="small">fas fa-broom</v-icon>
    </v-btn>

    <v-dialog scrollable v-model="showClean" max-width="600">
      <v-card :loading="fetching" title="Clean files" :subtitle="prettyBytes(sumSize(selected)) + ' to be removed'">

        <v-card-text>
          <v-data-table v-model="selectedIds" :headers="headers" :items="items" item-key="file" show-select
            items-per-page="-1">
            <template v-slot:item.size="{ item }">
              <div v-if="item.size > 0">
                {{ prettyBytes(item.size) }}
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

      this.selectedIds.forEach((id) => {
        selected.push(this.items.find(obj => obj.id === id))
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
      this.showClean = true;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/clean", { clearCacheEntry: true })
        .then(response => {
          this.items = response.data.files;
          this.cleanSize = response.data.size;
          this.fetching = false;

          this.selectedIds = [];
          this.items.forEach((item) => {
            this.selectedIds.push(item.id);
          });
        });
    },

    doClean() {
      this.fetching = true;

      let files = [];
      this.selected.forEach(item => files.push(item.id));

      api
        .post("servers/" + this.serverId + "/clean", { files: files })
        .then(() => {
          this.$emit('complete');          
          this.clean()
        });      
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>