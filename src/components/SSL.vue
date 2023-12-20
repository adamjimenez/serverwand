<template>
  <div>
    <v-card>
      <v-card-title primary-title>
        <v-btn @click="open"> SSL: {{ this.provider }} </v-btn>
      </v-card-title>
    </v-card>

    <v-dialog app scrollable v-model="showDialog" max-width="600">
      <v-card :loading="fetching">
        <v-alert v-if="this.error" type="error">
          {{ this.error }}
        </v-alert>

        <v-card-title> SSL </v-card-title>

        <v-card-text>
          <v-btn-toggle v-model="data.provider" mandatory>
            <v-btn value="none"> None </v-btn>

            <v-btn value="letsencrypt"> Let's Encrypt </v-btn>

            <v-btn value="custom"> Custom </v-btn>

            <v-btn value="selfsigned"> Self-Signed Certificate </v-btn>
          </v-btn-toggle>

          <div v-if="data.provider == 'custom'">
            <v-textarea
              v-model="data.private_key"
              name="private_key"
              filled
              label="Private key"
              auto-grow
              value=""
              :disabled="data.provider !== 'custom'"
            ></v-textarea>
            <v-textarea
              v-model="data.fullchain"
              name="fullchain"
              filled
              label="Certificate (Chained)"
              auto-grow
              value=""
              :disabled="data.provider !== 'custom'"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn color="success" @click="save"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  props: {
    siteId: null,
    provider: null,
    fullchain: null,
  },
  data() {
    return {
      message: "",
      showDialog: false,
      loading: true,
      fetching: false,
      error: null,
      data: {
        provider: "none",
      },
    };
  },
  created() {
    this.data.provider = this.provider;
    this.data.fullchain = this.fullchain;
  },

  methods: {
    open() {
      this.showDialog = true;
      this.data.provider = this.provider;
      this.data.private_key = "";
      this.data.fullchain = this.fullchain;
    },

    save() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .post("sites/" + this.siteId + "/ssl", this.data)
        .catch(error => console.log(error))
        .then(response => {
          self.fetching=false;

          if(typeof response==="undefined") {
            self.error="An error occurred";
          } else if(!response.data.success) {
            self.error=response.data.error;
          } else {
            self.$emit("closed");
            self.showDialog=false;
          }
        });
    },
  },
};
</script>