<template>
    <v-menu 
      offset-y
      v-model="isOpen"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          value:="menu"
          color="primary"
          dark
        >
            Create
            <v-icon dark>{{isOpen ? 'expand_less' : 'expand_more'}}</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="goto(item.to)"
        >          
          <v-list-item-avatar>
            <v-icon>{{item.avatar}}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
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