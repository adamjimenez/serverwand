<template>
    <v-text-field v-bind="$attrs" label="IP address" required :rules="[rules.required, rules.ip]" :modelValue="modelValue" placeholder="192.168.0.1">
        <template v-slot:append-inner>
            <v-icon v-if="remoteAddr" @click="setValue" title="Use local IP" icon="mdi:mdi-map-marker" />
        </template>
    </v-text-field>
</template>

<script>
export default {
    props: {
        remoteAddr: null,
        modelValue: {
            type: [String],
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            rules: {
                required: (value) => !!value || "Required.",
                ip: (v) =>
                    !v ||
                    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                        v
                    ) ||
                    "Invalid IP address",
            },
        };
    },
    methods: {
        setValue: function () {
            this.$emit('update:modelValue', this.remoteAddr);
        }
    }
}
</script>