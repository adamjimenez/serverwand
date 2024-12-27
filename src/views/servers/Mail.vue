<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-data-table v-if="items.length" v-model="selected" :headers="headers" :items="items" show-select
        mobile-breakpoint="0" @click:row="view" hover :row-props="rowProps">

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
    },
    rowProps(data) {
      if (this.selected.find(item => item === data.item.id)) {
        return {
            class: 'bg-primary'
        };
      }
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