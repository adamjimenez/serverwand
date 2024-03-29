<template>
    <span>
        <v-dialog v-model="dialog" :persistent="fetching" width="600">
            <v-alert v-if="error" type="error" :text="error"></v-alert>

            <v-alert title="Detaching" color="primary" v-if="fetching">
                <template v-slot:prepend>
                    <v-icon icon="fas fa-magic fa-2x faa-horizontal animated"></v-icon>
                </template>
            </v-alert>
        </v-dialog>

        <v-btn icon @click="run()" title="Detach Volume">
            <v-icon size="small">mdi:mdi-minus</v-icon>
        </v-btn>

        <Confirm ref="confirm" />
        <OAuth ref="oauth" />
    </span>
</template>
  
<script>
import api from "../services/api";
import Confirm from "./ConfirmDialog.vue";
import OAuth from "./OAuth.vue";

export default {
    components: {
        Confirm,
        OAuth,
    },
    props: {
        serverId: null,
        volume: null,
    },
    data() {
        return {
            fetching: false,
            dialog: false,
            error: null,
            items: [],
        };
    },

    methods: {
        async run() {
            if (!await this.$refs.confirm.open("Detach " + this.volume, 'Warning: this action can result in data-loss if the filesystem is in use.<br>\n<br>\nNote: The Volume will incur charges until deleted.')) {
                return;
            }

            this.dialog = true;
            this.error = null;
            this.fetching = true;

            api
                .post("servers/" + this.serverId + "/volumes", { detach: true, volume: this.volume })
                .then(async response => {
                    this.dialog = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return this.run();
                        case false:
                            this.dialog = true;
                            return;
                    }

                    if (response.data.error) {
                        this.dialog = true;
                        this.error = response.data.error;
                        return;
                    }

                    this.$emit('complete');
                })
                .finally(() => {
                    this.fetching = false;
                });
        },
    },
};
</script>