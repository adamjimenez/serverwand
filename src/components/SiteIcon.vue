<template>
    <v-icon v-if="app === 'wordpress'" @click.stop="openLink">fab fa-wordpress</v-icon>
    <v-icon v-else-if="app === 'git'">fab fa-git</v-icon>
    <v-icon v-else-if="app === 'node'">fab fa-node-js</v-icon>
    <v-icon v-else-if="app === 'joomla'">fab fa-joomla</v-icon>
    <v-icon v-else-if="app === 'drupal'">fab fa-drupal</v-icon>
    <v-icon v-else-if="app === 'magento'">fab fa-magento</v-icon>
    <v-icon v-else-if="app === 'roundcube'">fas fa-envelope</v-icon>
    <v-icon v-else-if="app === 'shiftlib'">fas fa-user-edit</v-icon>
    <v-icon v-else>fas fa-sitemap</v-icon>
</template>

<script>
export default {
  props: {
    app: null,
    to: null,
  },
  methods: {
    openLink() {
      if (this.to) {
        window.open(this.to);
      }
    },
  }
};
</script>