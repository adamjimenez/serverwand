<template>
    <v-menu offset-y left>
      <template v-slot:activator="{ on }">
        <v-btn
          icon
          v-on="on"
          value:="menu"
        >
            <i class="material-icons">account_circle</i>
        </v-btn>
      </template>
      <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            @click="goto(item.to)"
          >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
      </v-list>
    </v-menu>
</template>

<script>
export default {
  data: () => ({
    items: [
      { title: "Settings", to: "/settings/profile" },
      { title: "Log out", to: "/auth/logout" },
    ],
  }),

  methods: {
    goto(to) {
      this.$router.push(to);
    },
  },
};
</script>