<template>
    <v-icon v-if="provider === 'linode'">fab fa-linode</v-icon>
    <v-icon v-else-if="provider === 'digitalocean'">fab fa-digital-ocean</v-icon>
    <v-icon v-else>fas fa-server</v-icon>
</template>

<script>
export default {
  props: {
    provider: null,
  },  
};
</script>