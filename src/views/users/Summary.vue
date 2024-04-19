<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list lines="two">
        <v-list-item>
            <v-list-item-title> Name </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.name }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> Surname </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.surname }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> Email </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.email }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> Address </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.address }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> City </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.city }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> Postcode </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.postcode }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
            <v-list-item-title> Telephone </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.tel }}
            </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
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
      userId: null,
      post: null,
      error: null,
      data: {},
      details: "",
      loading: false,
      fetching: false,
      password: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      authRequired: false,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData(clearCacheEntry) {
      this.error = "";
      this.userId = this.$route.params.id;
      this.fetching = true;

      api
        .get("users/" + this.userId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(response => {
            console.log(response);

            this.data=response.data.item;
            document.title="Summary"+" | " + this.data.name;
          })
        .catch(error => console.log(error))
        .finally(() => this.fetching=false);
    },
  },
};
</script>