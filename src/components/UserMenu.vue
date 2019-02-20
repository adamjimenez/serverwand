<template>
    <v-menu offset-y left>
        <v-avatar
            slot="activator"
        >
            <i class="material-icons">account_circle</i>
        </v-avatar>
        <v-list>
            <v-list-tile
            v-for="(item, index) in items"
            :key="index"
            @click="goto(item.to)"
            >
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </v-menu>
</template>

<script>
  export default {
    data: () => ({
      items: [
        { title: 'Settings', to: '/settings/profile' },
        { title: 'Log out', to: '/auth/logout' }
      ]
    }),

    methods: {
      goto(to) {
        this.$router.push(to)
      }
    }
  }
</script>