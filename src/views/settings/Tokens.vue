<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="fetching" />

    <v-card class="mx-auto">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :value="item" :title="item.label">
            <template v-slot:append>
              <v-btn :disabled="dialog" :loading="loading === item.id" @click.stop="deleteItem(item.id)" size="small" icon="mdi:mdi-delete"></v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="API token ">
        <v-card-text>
          <v-select v-model="provider_token.provider" :items="providers" label="Provider"></v-select>

          <v-text-field v-model="provider_token.label" label="Label" required></v-text-field>

          <v-text-field v-if="provider_token.provider === 'nominet'" v-model="provider_token.username" label="Username"
            required></v-text-field>

          <v-text-field v-if="provider_token.provider === 'nominet'" v-model="provider_token.password" label="Password"
            type="password" required></v-text-field>

          <v-text-field v-model="provider_token.token" label="Token" required></v-text-field>

          <v-btn :disabled="!provider_token.provider || provider_token.label == '' || provider_token.token == ''"
            :loading="fetching" color="success" @click="submitToken">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Confirm,
  },
  data() {
    return {
      error: "",
      data: {
        label: "",
      },
      providers: [{
        title: "Linode",
        value: "linode",
      }, {
        title: "Digital Ocean",
        value: "digitalocean",
      }, {
        title: "NameSilo",
        value: "namesilo",
      }, {
        title: "Nominet",
        value: "nominet",
      }],
      items: [],
      dialog: false,
      details: "",
      fetching: true,
      loading: null,
      /*
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        */
      server: {
        name: "",
      },
      provider_token: {
        provider: null,
        label: '',
        token: '',
      },
      drawer: false,
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("providers/tokens")
        .then((response) => {
          console.log(response);
          this.items = response.data.tokens;
          document.title = "Tokens";
        })
        .catch((error) => {
          this.error = error;
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.data.label = "";
      this.drawer = true;
    },
    deleteItem: async function (id) {
      if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
        return;
      }

      this.error = "";
      this.loading = id;

      api
        .post("providers/tokens/" + id, { delete: 1 })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
        });
    },
    submitToken() {
      api
        .post("providers/tokens", this.provider_token)
        .then((response) => {
          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.drawer = false;
            this.fetchData();
          }
        })
        .catch((error) => {
          this.error = error;
        });
    },
  },
};
</script>