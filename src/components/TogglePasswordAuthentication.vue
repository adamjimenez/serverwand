<template>
  <div>
    <v-switch v-model="data.passwordAuthentication" label="Password Authentication" @change="togglePasswordAuthentication" hide-details color="primary">
      <template v-slot:prepend>
        <v-tooltip location="top" text="We recommend this is
            disabled in favour of key authentication.">
          <template v-slot:activator="{ props }">
            <v-icon color="primary" v-bind="props">
              mdi:mdi-information
            </v-icon>
          </template>
        </v-tooltip>
      </template>
    </v-switch>
  </div>
</template>

<script>
import api from "../services/api";
import Template from '../views/auth/Template.vue';

export default {
  components: { Template },
  props: {
    serverId: null,
    passwordAuthentication: null,
  },

  watch: {
    passwordAuthentication: function (newVal) {
      this.data.passwordAuthentication = newVal;
    }
  },

  data() {
    return {
      fetching: false,
      data: {
        passwordAuthentication: false,
      },
    };
  },

  created() {
    this.data.passwordAuthentication = this.passwordAuthentication
  },

  methods: {
    togglePasswordAuthentication() {
      var self = this;
      this.error = "";
      this.fetching = true;
      this.loading = true;

      api
        .post("servers/" + this.serverId + "/password_authentication", {
          save: 1,
          enable: this.data.passwordAuthentication,
        })
        .then(response => {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else if (response.data.success) {
            self.$emit("complete");
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          self.fetching = false;
          self.loading = false;
        });
    },
  },
};
</script>