<template>
  <span>
    <span v-if="!hideText">
      <span v-if="yesno">
        {{ val ? "Yes" : "No" }}
      </span>

      <span v-else-if="password">
        {{ "******" }}
      </span>

      <span v-else>
        {{ val }}
      </span>
    </span>

    <v-btn icon @click="edit(val)">
      <v-icon size="small">mdi:mdi-pencil</v-icon>
    </v-btn>

    <v-dialog app v-model="dialog" max-width="600">
      <v-card :loading="fetching">
        <v-card-title> Edit {{ label }} </v-card-title>

        <v-card-text>
          <v-alert v-if="error" type="error" :text="error"></v-alert>

          <v-select v-if="yesno" v-model="data.val" :items="yesnoItems" :label="label" autofocus
            :error="errors.length > 0" :error-messages="errors"></v-select>

          <PasswordField v-else-if="password" v-model="data.val" bind="$attrs"></PasswordField>

          <v-text-field v-else v-model="data.val" :label="label" autofocus :error-messages="errors"></v-text-field>

          <v-btn color="primary" @click="save"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../services/api";
import PasswordField from "./PasswordField.vue";

export default {
  components: {
    PasswordField,
  },
  props: {
    name: null,
    val: null,
    label: null,
    password: Boolean,
    hideText: Boolean,
    path: null,
    yesno: Boolean,
  },
  data() {
    return {
      error: '',
      fetching: false,
      dialog: false,
      data: {
        val: null,
      },
      showPassword: false,
      yesnoItems: [{
        title: "Yes",
        value: 1,
      }, {
        title: "No",
        value: 0,
      }],
      errors: [],
    };
  },

  watch: {
    val: function (newVal) {
      this.data.val = newVal;
    },
  },

  methods: {
    edit() {
      this.data.val = this.val;
      this.dialog = true;
    },
    save() {
      this.fetching = true;
      this.error = '';

      var data = {};
      data[this.name] = this.data.val;

      var self = this;
      api
        .post(this.path, data)
        .then(response => {
          console.log(response);

          if (response.data.success) {
            self.dialog = false;
            self.$emit("save");
          } else {
            self.error = response.data.error;
          }
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    },
  },
};
</script>