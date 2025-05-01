<template>
    <v-text-field v-bind="$attrs" label="IP address" required :rules="[rules.required, rules.ip]" :placeholder="placeholder" v-model="value">
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
        any: null,
    },
    data() {
        return {
            value: '',
            rules: {
                required: (value) => !!value || "Required",
                ip: (v) =>
                    (v === "any" && this.$props.any !== 'undefined') || 
                    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) ||
                    "Invalid IP address",
            },
            placeholder: '192.168.0.1',
        };
    },
    methods: {
        setValue: function () {
            this.value = this.remoteAddr;
            this.$emit('update:modelValue', this.remoteAddr);
        }
    },
    mounted: function () {
        this.value = this.modelValue;

        if (typeof this.$props.any !== 'undefined') {
            this.placeholder += ', any';
        }
    }
}
</script>