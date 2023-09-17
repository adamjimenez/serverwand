<template>
  <div>
    <v-container fluid class="py-1">
      <v-row>
        <v-col>
          <v-list-item title="Settings"></v-list-item>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs>
      <v-tab :to="'/settings/profile'">Profile</v-tab>
      <v-tab :to="'/settings/api'">API</v-tab>
      <v-tab :to="'/settings/tokens'">Tokens</v-tab>
      <v-tab :to="'/settings/products'">Products</v-tab>
    </v-tabs>
    <router-view></router-view>
  </div>
</template>