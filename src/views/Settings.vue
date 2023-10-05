<template>
  <div>
    <v-container fluid class="py-1">
      <v-row>
        <v-col>
          <v-list-item title="Settings"></v-list-item>
        </v-col>
      </v-row>
    </v-container>

    <Tabs>
      <v-tab :to="'/settings/profile'">Profile</v-tab>
      <v-tab :to="'/settings/api'">API</v-tab>
      <v-tab :to="'/settings/tokens'">Tokens</v-tab>
      <v-tab :to="'/settings/products'">Products</v-tab>
    </Tabs>
    <router-view></router-view>
  </div>
</template>

<script>
import Tabs from "../components/Tabs";

export default {
  components: {
    Tabs,
  },
}
</script>