<template>
    <v-menu offset-y>
        <v-btn
            slot="activator"
            color="primary"
            dark
        >
            Create
        </v-btn>
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
        { title: 'Server', to: '/servers/create' },
        { title: 'Domain', to: '/domains/create' },
        //{ title: 'Mail', to: '/mail/create' },
        //{ title: 'User', to: '/users/create' }
      ]
    }),
    methods:{
      goto(to) {
        this.$router.push(to)
      }
    }
  }
</script>