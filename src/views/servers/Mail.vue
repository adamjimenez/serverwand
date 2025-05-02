<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-card-actions>
        <v-btn @click="fetchData" :loading="fetching"><v-icon size="small">mdi:mdi-reload</v-icon></v-btn>
        <v-btn v-if="selected.length" @click="deleteMail()" :disabled="selected.length" :loading="fetching"> <v-icon
            size="small">mdi:mdi-delete</v-icon> </v-btn>
        <ClearMailQueue v-if="data.server?.queue" serverId="serverId" :server="data" class="mx-3"
          @complete="handleComplete" />
      </v-card-actions>

      <v-data-table
        v-if="items.length"
        v-model="selected"
        :headers="headers"
        :items="items"
        :items-per-page="100"
        :show-select="display.smAndUp"
        mobile-breakpoint="0"
        hover
        :row-props="rowProps"
        fixed-header        
        :hide-default-header="!display.smAndUp"
        style="height: calc(100vh - 260px); overflow: auto;"
        @click:row="view"
        @contextmenu:row="select"
      >

        <template v-slot:item.date="{ item }">
          <span>{{ formatDate(item.date) }}</span>
        </template>

        <template v-slot:item.size="{ item }">
          <span>{{ prettyBytes(item.size) }}</span>
        </template>

      </v-data-table>

      <v-card-text v-else> Queue empty </v-card-text>
    </v-card>

    <v-dialog app v-model="emailDrawer">
      <v-card>
        <v-card-title class="d-flex">
          <div class="text-truncate mr-4" style="max-width: 50%;">
            <div class="text-truncate" title="From: {{ message.sender }}">
              From: {{ message.sender }}
            </div>
            <div class="text-truncate" title="To: {{ message.recipient }}">
              To: {{ message.recipient }}
            </div>
          </div>

          <v-spacer></v-spacer>

          <div class="text-right">
            {{ formatDate(message.date) }}<br>
            {{ prettyBytes(message.size) }}
          </div>
        </v-card-title>

        <v-card-text>
          <iframe width="100%" height="315" :src="messageUrl" frameborder="0"></iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../../services/api";
import util from "../../services/util";
import Loading from "../../components/Loading";
import ClearMailQueue from "../../components/ClearMailQueue";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading,
    ClearMailQueue,
  },
  data() {
    return {
      error: "",
      items: [],
      data: {},
      details: "",
      message: "",
      messageUrl: "",
      loading: false,
      fetching: false,
      emailDrawer: false,
      serverId: 0,
      selected: [],
      headers: [{
        title: "Date",
        key: "date",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "From",
        key: "sender",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "To",
        key: "recipient",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "Size",
        key: "size",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }]
    };
  },
  created() {
    this.display = this.$vuetify.display;
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/messages")
        .then(response => {
          console.log(response);
          this.data = response.data.item;
          this.items = response.data.messages;

          this.items = [];
          response.data.messages?.forEach((element) => {
            this.items.push({
              id: element.id,
              size: element.size,
              sender: element.sender,
              recipient: element.recipient,
              date: element.date,
              //selected: false,
            });
          });

          document.title = "Mail" + " | " + this.data?.name;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);
    },
    deleteMail() {
      // get selected ids
      var ids = [];
      this.selected.forEach((element) => {
        ids.push(element);
      });

      // process deletions
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/messages", { ids: ids })
        .then(() => this.fetchData())
        .catch((error) => console.log(error))
        .finally(() => this.fetching = false);
    },
    view(event, item) {
      this.message = item.item
      this.messageUrl =
        "https://serverwand.com/api/servers/" +
        this.serverId +
        "/messages/" +
        this.message.id;
      this.emailDrawer = true;
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
    handleComplete: function (result) {
      this.error = result;
      this.fetchData();
    },
    rowProps(data) {
      if (this.selected.find(item => item === data.item.id)) {
        return {
          class: 'bg-primary'
        };
      }
    },
    formatDate(value) {
      return util.formatDate(value);
    },
    select(event, item) {
      event.preventDefault();

      let found = -1;
      this.selected.forEach((v, index) => {
        if (item.item.id == v) {
          found = index;
        }
      });

      if (found > -1) {
        this.selected.splice(found, 1);
      } else {
        this.selected.push(item.item.id);
      }
    },
  },
};
</script>

<style>
iframe {
  background-color: #fff;
  height: calc(100vh - 200px);
}
</style>