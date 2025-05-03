<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="fetchData" :loading="fetching"><v-icon size="small">mdi:mdi-reload</v-icon></v-btn>
        <v-btn @click="unban()" v-if="selected.length" :loading="loading === 'unban'"> <v-icon size="small">mdi:mdi-delete</v-icon> </v-btn>

        <v-spacer></v-spacer>

        <v-switch v-model="active" label="Active" @change="toggle()" hide-details color="primary"
          :loading="loading === 'toggle'"></v-switch>
      </v-card-actions>

      <v-data-table
        v-if="items.length"
        v-model="selected"
        :headers="headers"
        :items="items"
        :items-per-page="100"
        item-value="ip"
        :show-select="display.smAndUp"
        mobile-breakpoint="0"
        hover
        :row-props="rowProps"
        items-per-page-text=""
        fixed-header        
        :hide-default-header="!display.smAndUp"
        class="overflow-auto"
        :style="display.mobile ? 'height: calc(100vh - 240px);' : 'height: calc(100vh - 280px);'"
        @contextmenu:row="select"
      >

        <template v-slot:item.ip="{ item }">
          <span>
            <v-tooltip :text="item.ip_data?.org + ', ' + item.ip_data?.city + ', ' + item.ip_data?.country">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :class="'fi fi-' + item?.ip_data?.country?.toLowerCase() + ' fis'"
                  size="x-small"></v-btn>
              </template>
            </v-tooltip>
            {{ item.ip }}
          </span>
        </template>
      </v-data-table>

      <v-card-text v-else> Empty </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  data() {
    return {
      error: "",
      items: [],
      data: {},
      loading: null,
      fetching: false,
      serverId: 0,
      selected: [],
      headers: [{
        title: "IP",
        key: "ip",
      }, {
        title: "Jail",
        key: "jail",
      }],
      active: false,
    };
  },
  created() {
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/banned")
        .then(response => {
          console.log(response);

          this.active = response.data.active;
          this.items = response.data.items;

          document.title = "Banned" + " | " + response.data.item.name;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
    toggle() {
      this.loading = 'toggle'
      this.error = ''

      api.post("servers/" + this.serverId + "/services", {
        name: 'fail2ban',
        start: this.active,
      })
        .then(response => {
          console.log(response)

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData()
          }
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          this.loading = null
        })
    },
    unban() {
      // get selected ids
      let items = [];
      this.selected.forEach((element) => {
        items.push(element);
      });

      // process deletions
      this.loading = 'unban';

      api
        .post("servers/" + this.serverId + "/banned", { items: items })
        .then(() => this.fetchData())
        .catch((error) => console.log(error))
        .finally(() => this.loading = null);
    },
    handleComplete: function (result) {
      this.error = result;
      this.fetchData();
    },
    rowProps(data) {
      if (this.selected.find(item => item === data.item.ip)) {
        return {
          class: 'bg-primary'
        };
      }
    },    
    select(event, item) {
      event.preventDefault();

      let found = -1;
      this.selected.forEach((v, index) => {
        if (item.item.ip == v) {
          found = index;
        }
      });

      if (found > -1) {
        this.selected.splice(found, 1);
      } else {
        this.selected.push(item.item.ip);
      }
    },
  },
};
</script>