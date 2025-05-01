<template>
    <v-text-field v-bind="$attrs" :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi:mdi-eye-off' : 'mdi:mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        v-model="value"
        autocomplete="new-password"
        >
            <template v-slot:append-inner="{ props }">
                <v-tooltip :text="copyText" top>
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" @click="generate" @mouseleave="resetCopyText" class="ma-3 cursor-pointer" ref="container">
                            <v-icon size="small">mdi:mdi-dice-multiple</v-icon>
                        </span>
                    </template>
                </v-tooltip>
            </template>
    </v-text-field>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: [String],
        },
    },
    data() {
        return {
            showPassword: false,
            value: '',
            defaultText: "Generate",
            copyText: "",
        };
    },
    methods: {
        generate: function () {
            this.showPassword = true;

            const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lower = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const symbols = '_-!@';
            const all = upper + lower + numbers + symbols;

            let password = '';
            for (let i = 0; i < 12; i++) {
                password += all.charAt(Math.floor(Math.random() * all.length));
            }

            this.value = password;
            this.$emit('update:modelValue', this.value);

            // copy to clipboard
            const el = document.createElement("textarea");
            this.$refs["container"].appendChild(el);
            el.setAttribute("id", "clipboard");
            el.value = this.value;
            el.select();
            document.execCommand("Copy");
            el.parentNode.removeChild(el);
            
            this.copyText = "Copied";
        },
        resetCopyText() {
            setTimeout(() => this.copyText = this.defaultText, 500);
        },
    },
    mounted: function () {
        this.value = this.modelValue;

        if (typeof this.$props.any !== 'undefined') {
            this.placeholder += ', any';
        }
        this.copyText = this.defaultText;
    }
}
</script>