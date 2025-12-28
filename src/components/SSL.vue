<template>
  <div>

    <v-list-item title="SSL">
      <template v-slot:subtitle>
        <span class="text-capitalize">{{ subtitle }}</span>
        <v-icon v-if="sslValid" color="success">mdi:mdi-check</v-icon>
        <v-icon v-else color="error">mdi:mdi-close</v-icon>
      </template>
      <template v-slot:append>
        <v-btn icon @click="open()">
            <v-icon size="small">mdi:mdi-wrench</v-icon>
        </v-btn>
      </template>
    </v-list-item>

    <v-dialog app scrollable v-model="showDialog" max-width="600">
      <v-card :loading="fetching" title="SSL">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-card-text>
          <v-btn-toggle v-model="data.provider" mandatory>
            <v-btn value="none"> None </v-btn>
            <v-btn value="letsencrypt"> Let's Encrypt </v-btn>
            <v-btn value="custom"> Custom </v-btn>
            <v-btn value="selfsigned"> Self-Signed Certificate </v-btn>
          </v-btn-toggle>

          <div v-if="data.provider == 'custom'">
            <v-textarea v-model="data.private_key" name="private_key" filled label="Private key" auto-grow value=""
              :disabled="data.provider !== 'custom'"></v-textarea>
            <v-textarea v-model="data.fullchain" name="fullchain" filled label="Certificate (Chained)" auto-grow
              value="" :disabled="data.provider !== 'custom'"></v-textarea>
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
    ssl: null,
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
    this.data = this.ssl;
  },

  methods: {
    open() {
      this.showDialog = true;
      this.data = this.ssl;
    },

    save() {
      this.error = "";
      this.fetching = true;

      api
        .post("sites/" + this.siteId + "/ssl", this.data)
        .catch(error => console.log(error))
        .then(response => {
          this.fetching = false;

          if (typeof response === "undefined") {
            this.error = "An error occurred";
          } else if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.$emit("closed");
            this.showDialog = false;
          }
        });
    },
  },

  computed: {
    subtitle() {
      let subtitle = this.ssl?.provider

      if (this.ssl?.expiry) {
        subtitle += '. expires: ' + this.ssl?.expiry;
      }

      return subtitle;
    },
    sslValid() {
      if (this.ssl?.expiry) {
        const date = new Date(this.ssl?.expiry.replace(/-/g, ' '));

        if (date < new Date()) {
          return false;
        }
      }

      return true;
    }
  }
};
</script>