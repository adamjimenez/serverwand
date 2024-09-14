<template>
    <div>
      <v-alert v-if="error" type="error" :text="error"></v-alert>
  
      <Loading :value="loading" />
  
      <v-card :loading="fetching">
  
        <v-data-table v-if="items.length" v-model="selected" :headers="headers" :items="items" item-value="ip" show-select class="results"
          mobile-breakpoint="0">

            <template v-slot:item.ip="{ item }">
                <span>{{ item.ip }} 
                    <v-tooltip :text="item.ip_data?.org  + ', ' + item.ip_data?.city + ', ' + item.ip_data?.country">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" :class="'fi fi-'+ item?.ip_data?.country?.toLowerCase() + ' fis'" class="ml-1" size="x-small"></v-btn>
                      </template>
                    </v-tooltip>
                </span>
            </template>
        </v-data-table>
  
        <v-card-text v-else> Empty </v-card-text>
      </v-card>
  
      <v-card>
        <v-card-actions>
          <v-btn @click="unban()" :disabled="selected.length === 0" :loading="fetching"> Unban </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </template>
  
  <script>
  import api from "../../services/api";
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
        loading: false,
        fetching: false,
        serverId: 0,
        selected: [],
        headers: [{
          title: "",
          key: "",
        }, {
          title: "IP",
          key: "ip",
        }, {
          title: "Jail",
          key: "jail",
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
          .get("servers/" + this.serverId + "/banned")
          .then(response => {
            console.log(response);

            this.items = response.data.items;
  
            document.title = "Banned" + " | " + response.data.item.name;
          })
          .catch(error => console.log(error))
          .finally(() => this.fetching = false);
      },
      unban() {
        // get selected ids
        let items = [];
        this.selected.forEach((element) => {
            items.push(element);
        });
  
        // process deletions
        this.fetching = true;
  
        api
          .post("servers/" + this.serverId + "/banned", { items: items })
          .then(() => this.fetchData())
          .catch((error) => console.log(error))
          .finally(() => this.fetching = false);
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