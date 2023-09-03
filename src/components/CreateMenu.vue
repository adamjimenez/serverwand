<template>
  <v-menu offset-y v-model="isOpen">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" style="background-color: #A25C57;">
        <v-icon>mdi:mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(item, index) in items" :key="index" @click="goto(item.to)">
        <v-row>
          <v-col cols="4">
            <v-icon>{{ item.avatar }}</v-icon>
          </v-col>
          <v-col>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-col>
        </v-row>
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