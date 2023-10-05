<template>
    <v-text-field v-bind="$attrs" autofocus :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'mdi:mdi-eye-off' : 'mdi:mdi-eye'"
        @click:append="showPassword = !showPassword"></v-text-field>
</template>

<script>
export default {
    data() {
        return {
            showPassword: false,
        };
    },
}
</script>