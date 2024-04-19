<template>
  <v-menu offset-y left>
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi:mdi-account-circle" v-bind="props"></v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(item, index) in items" :key="index" @click="goto(item.to)" :title="item.value"
        :prepend-icon="item.icon">
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data: () => ({
    items: [
      { value: "Settings", to: "/settings/profile", icon: 'fas fa-wrench' },
      { value: "Log out", to: "/auth/logout", icon: 'fas fa-sign-out-alt' },
    ],
  }),

  methods: {
    goto(to) {
      this.$router.push(to);
    },
  },
};
</script>