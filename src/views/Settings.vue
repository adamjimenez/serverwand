<template>
  <v-layout row>
    <v-flex>

      <v-card>        
        <v-card-title primary-title>
          <div class="headline">Settings</div>
        </v-card-title>
      
        <v-tabs>
          <v-tab :to="'/settings/profile'">Profile</v-tab>
          <v-tab :to="'/settings/api'">API</v-tab>
        </v-tabs>
        <router-view></router-view>      
      </v-card>

    </v-flex>
  </v-layout>
</template>

