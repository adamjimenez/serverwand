<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>
      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.variables" :key="`item-${i}`" :title="item.name" :subtitle="item.value"
          @click="editItem(item)">
          <template v-slot:append>
            <v-btn :disabled="fetching" :loading="loading === item.line" @click.stop="deleteItem(item.line)" icon="mdi:mdi-delete"
              size="small"></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            Variable
          </div>

         <v-btn
           icon="mdi:mdi-close"
           variant="text"
           @click="drawer = false"
          ></v-btn>
        </v-card-title>
        <v-form v-model="valid" ref="form">
          <v-card-text>
            <v-text-field v-model="item.line" label="Line" v-show="false"></v-text-field>

            <v-text-field v-model="item.name" label="Name" required
              :rules="[rules.required, rules.alphanumeric]" autofocus></v-text-field>

            <v-text-field v-model="item.value" label="Value" required
              :rules="[rules.required, rules.alphanumeric]"></v-text-field>

            <v-btn :disabled="!valid" :loading="loading === 'save'" color="success" @click="saveItem">
              Save
            </v-btn>
          </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Confirm,
  },
  data() {
    return {
      error: "",
      fetching: false,
      loading: null,
      drawer: false,
      data: {
        users: {},
      },
      item: {
        name: "",
        value: "",
      },
      variables: [],
      rules: {
        required: (value) => !!value || "Required.",
        alphanumeric: (v) =>
          /^[a-zA-Z0-9-_!\.]+$/g.test(v) || "Must contain alphanumeric characters only",
      },
      valid: false,
    };
  },
  created() {
    this.siteId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/variables")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.data = response.data.item;
          document.title = "Variables" + " | " + this.data.name;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.item = {};
      this.drawer = true;
    },
    editItem(item) {
      this.item = JSON.parse(JSON.stringify(item));
      this.drawer = true;
    },
    deleteItem: async function (line) {
      if (!await this.$refs.confirm.open("Delete Variable?")) {
        return;
      }

      this.loading = line;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/variables", { line: line })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.fetching = false;
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
    saveItem: async function() {
      this.error = "";

      if (this.$refs.form.validate()) {
        this.loading = 'save';
        const result = await api.post("sites/" + this.siteId + "/variables", this.item);

        if (result.data.error) {
          this.error = result.data.error;
        } else {
          this.drawer = false;
          this.fetchData();
        }
        
        this.loading = null;
      }
    },
  },
};
</script>
