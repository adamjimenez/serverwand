<template>
    <v-layout>
      <v-flex>
      
        <v-subheader>
          <v-icon left>fas fa-user</v-icon>
          <h1>Settings</h1>
        </v-subheader>

        <v-tabs>
          <v-tab :to="'/settings/profile'">Profile</v-tab>
          <v-tab :to="'/settings/api'">API</v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-flex>

    </v-layout>
</template>

