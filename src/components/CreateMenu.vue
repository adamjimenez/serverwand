<template>
    <v-menu 
      offset-y
      v-model="isOpen"
    >
        <v-btn
          value:="menu"
          slot="activator"
          color="primary"
          dark
        >
            Create
             <v-icon dark>{{isOpen ? 'expand_more' : 'expand_less'}}</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile avatar
          v-for="(item, index) in items"
          :key="index"
          @click="goto(item.to)"
          >          
            <v-list-tile-avatar>
              <v-icon>{{item.avatar}}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
    </v-menu>
</template>

<script>
  export default {
    data: () => ({
      isOpen: false,
      items: [
        { title: 'Server', to: '/servers/create', avatar: 'fas fa-server' },
        { title: 'Domain', to: '/domains/create', avatar: 'fas fa-globe' },
        { title: 'Team', to: '/teams/create', avatar: 'fas fa-users' },
        //{ title: 'User', to: '/users/create', avatar: 'fas fa-user' }
      ]
    }),
    methods:{
      goto(to) {
        this.$router.push(to)
      }
    }
  }
</script>