<template>
  <v-layout row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title primary-title>
            <div class="headline">Settings</div>
          </v-card-title>

          <v-tabs>
            <v-tab :to="'/settings/profile'">Profile</v-tab>
            <v-tab :to="'/settings/api'">API</v-tab>
            <v-tab :to="'/settings/tokens'">Tokens</v-tab>
            <v-tab :to="'/settings/products'">Products</v-tab>
          </v-tabs>
          <router-view></router-view>
        </v-card>
      </v-col></v-row>
  </v-layout>
</template>