<template>
    <v-tabs v-bind="$attrs" :show-arrows="!isTouchDevice">
        <slot></slot>
    </v-tabs>
</template>

<script>
export default {
    data() {
        return {
            isTouchDevice: false
        }
    },
    methods: {
        checkTouch() {
            this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        }
    },
    mounted() {
        window.addEventListener('resize', this.checkTouch);
        this.checkTouch();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.checkTouch);
    }
}
</script>