<template>
  <span>
    <span v-if="yesno">
      {{ val ? "Yes" : "No" }}
    </span>

    <span v-else-if="password">
      {{ "******" }}
    </span>

    <span v-else-if="!hideText">
      {{ val }}
    </span>

    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon @click="edit(val)">
          <v-icon small>create</v-icon>
        </v-btn>
      </template>
      <span>Edit</span>
    </v-tooltip>

    <v-dialog app v-model="dialog">
      <v-card :loading="fetching">
        <v-card-title> Edit {{ label }} </v-card-title>

        <v-card-text>
          <v-select
            v-if="yesno"
            v-model="data.val"
            :items="yesnoItems"
            :label="label"
            autofocus
            :error="errors.length > 0"
            :error-messages="errors"
          ></v-select>

          <v-text-field
            v-else
            v-model="data.val"
            :label="label"
            autofocus
            :type="!password || showPassword ? 'text' : 'password'"
            :append-icon="
              !password ? '' : showPassword ? 'visibility_off' : 'visibility'
            "
            @click:append="showPassword = !showPassword"
            :error-messages="errors"
          ></v-text-field>

          <v-btn color="primary" @click="save"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import api from "../services/api";

export default {
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
      fetching: false,
      dialog: false,
      data: {
        val: null,
      },
      showPassword: false,
      yesnoItems: [
        {
          text: "Yes",
          value: 1,
        },
        {
          text: "No",
          value: 0,
        },
      ],
      errors: [],
    };
  },
  created() {
    this.data.val = this.val;
  },
  methods: {
    edit() {
      this.data.val = this.val;
      this.dialog = true;
    },
    save() {
      this.fetching = true;
      this.errors = [];

      var data = {};
      data[this.name] = this.data.val;

      var self = this;
      api
        .post(this.path, data)
        .then(function (response) {
          console.log(response);

          if (response.data.success) {
            self.val = self.data.val;
            self.dialog = false;
            self.$emit("save");
          } else {
            self.errors.push(response.data.error);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
  },
};
</script>