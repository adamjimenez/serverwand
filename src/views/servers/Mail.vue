<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-data-table v-if="items.length" v-model="selected" :headers="headers" :items="items" show-select class="results"
        mobile-breakpoint="0" @click:row="view">

        <template v-slot:item.size="{ item }">
          <span>{{ prettyBytes(item.size) }}</span>
        </template>

      </v-data-table>

      <v-card-text v-else> Queue empty </v-card-text>
    </v-card>

    <v-card>
      <v-card-actions>
        <v-btn @click="deleteMail()" :disabled="selected.length === 0" :loading="fetching"> Delete </v-btn>
        <ClearMailQueue serverId="serverId" :server="data" class="mx-3" @complete="handleComplete" />
      </v-card-actions>
    </v-card>

    <v-dialog app v-model="emailDrawer">
      <v-card>
        <v-card-title> Message: {{ messageId }} </v-card-title>

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
      messageId: "",
      messageUrl: "",
      loading: false,
      fetching: false,
      emailDrawer: false,
      serverId: 0,
      selected: [],
      headers: [{
        title: "",
        key: "",
      }, {
        title: "ID",
        key: "id",
      }, {
        title: "Size",
        key: "size",
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
        title: "Date",
        key: "date",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }],
    };
  },
  created() {
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/messages")
        .then(response => {
          console.log(response);
          self.data = response.data.item;
          self.items = response.data.messages;

          self.items = [];
          response.data.messages.forEach((element) => {
            self.items.push({
              id: element.id,
              size: element.size,
              sender: element.sender,
              recipient: element.recipient,
              date: element.date,
              //selected: false,
            });
          });

          document.title = "Mail" + " | " + self.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
    deleteMail() {
      var self = this;

      // get selected ids
      var ids = [];
      this.selected.forEach((element) => {
        ids.push(element);
      });

      // process deletions
      self.fetching = true;

      api
        .post("servers/" + this.serverId + "/messages", { ids: ids })
        .then(() => self.fetchData())
        .catch((error) => console.log(error))
        .finally(() => self.fetching = false);
    },
    view(event, item) {
      this.messageId = item.item.id
      this.messageUrl =
        "https://serverwand.com/api/servers/" +
        this.serverId +
        "/messages/" +
        this.messageId;
      this.emailDrawer = true;
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
    handleComplete: function (result) {
      this.error = result;
      this.fetchData();
    }
  },
};
</script>

<style>
iframe {
  background-color: #fff;
  height: calc(100vh - 200px);
}
</style>