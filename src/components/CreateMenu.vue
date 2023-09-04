<template>
  <v-menu offset-y v-model="isOpen">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi:mdi-plus" color="primary" variant="flat" size="small" class="mx-1"></v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(item, index) in items" :key="index" @click="goto(item.to)" :title="item.title">
        <template v-slot:prepend>
          <v-icon :icon="item.avatar"></v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data: () => ({
    isOpen: false,
    items: [
      { title: "Server", to: "/servers/create", avatar: "fas fa-server" },
      { title: "Site", to: "/sites/create", avatar: "fas fa-sitemap" },
      /*{ title: 'Domain', to: '/domains/create', avatar: 'fas fa-globe' },*/
      { title: "Team", to: "/teams/create", avatar: "fas fa-users" },
      { title: "User", to: "/users/create", avatar: "fas fa-user" },
    ],
  }),
  methods: {
    goto(to) {
      this.$router.push(to);
    },
  },
};
</script>