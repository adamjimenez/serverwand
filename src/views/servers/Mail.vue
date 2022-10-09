<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">

      <v-container fluid>
        <v-row>
          <v-card>
            <v-card-text>
              Mail queue: {{ data.queue }}
            </v-card-text>
          </v-card>
        </v-row>
      </v-container>

      <v-data-table
        v-if="items.length"
        v-model="selected"
        :headers="headers"
        :items="items"
        show-select
        class="results"
        mobile-breakpoint="0"
        @click:row="view"
      >

        <template v-slot:item.size="{ item }">
          <span>{{ item.size | prettyBytes }}</span>
        </template>

      </v-data-table>

      <v-card-text v-else> Queue empty </v-card-text>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="deleteMail()" :disabled="selected.length === 0" :loading="fetching"> Delete </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-dialog app v-model="emailDrawer">
      <v-card>
        <v-card-title> Message: {{ message_id }} </v-card-title>

        <v-card-text>
          <iframe
            width="100%"
            height="315"
            :src="message_url"
            frameborder="0"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";

export default {
  components: {
    Loading,
  },
  data() {
    return {
      error: "",
      items: [],
      data: {},
      details: "",
      message: "",
      message_url: "",
      message_id: "",
      loading: false,
      fetching: false,
      emailDrawer: false,
      serverId: 0,
      selected: [],
      headers: [
        {
          text: "",
          value: "",
        },
        {
          text: "ID ",
          value: "id",
        },
        {
          text: "Size ",
          value: "size",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "From ",
          value: "from",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "To ",
          value: "to",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "Date ",
          value: "date",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
      ],
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
            self.data=response.data.item;
            self.items=response.data.messages;

            self.items=[];
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

            document.title="Mail"+" | "+self.data.name;
          })
        .catch(error => console.log(error))
        .finally(() => self.fetching=false);
    },
    deleteMail() {

      var self = this;

      // get selected ids
      var ids = [];
      this.selected.forEach((element) => {
        ids.push(element.id);
      });
      
      // process deletions
      self.fetching = true;

      api
        .post("servers/" + this.serverId + "/messages", { ids: ids })
        .then(() => self.fetchData())
        .catch((error) => console.log(error))
        .finally(() => self.fetching=false);
    },
    view(item) {
      this.message_id = item.id;
      this.message_url =
        "https://serverwand.com/api/servers/" +
        this.serverId +
        "/messages/" +
        this.message_id;
      this.emailDrawer = true;
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