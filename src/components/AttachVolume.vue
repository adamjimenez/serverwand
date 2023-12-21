<template>
    <span>
        <v-btn icon @click="open()" title="Attach Volume">
            <v-icon size="small">mdi:mdi-plus</v-icon>
        </v-btn>

        <v-dialog app scrollable v-model="dialog" max-width="600">
            <v-alert v-if="error" type="error" :text="error"></v-alert>

            <v-card :loading="fetching" title="Attach Volume">

                <v-card-text>
                    <v-select v-model="volume" :items="items" item-title="name" item-value="name"></v-select>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn @click="run()" :disabled="!volume" color="success" :loading="fetching">
                        Attach
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <OAuth ref="oauth" />
    </span>
</template>
  
<script>
import api from "../services/api";
import OAuth from "./OAuth.vue";

export default {
    components: {
        OAuth,
    },
    props: {
        serverId: null,
    },
    data() {
        return {
            fetching: false,
            dialog: false,
            volume: null,
            error: null,
            items: [],
        };
    },

    methods: {
        open() {
            this.dialog = true;
            this.fetching = true;

            api
                .get("servers/" + this.serverId + "/volumes", { clearCacheEntry: true })
                .then(async response => {
                    this.fetching = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return this.open();
                        case false:
                            this.dialog = false;
                            return;
                    }

                    this.items = response.data.available;
                });
        },

        run() {
            this.error = null;
            this.fetching = true;

            api
                .post("servers/" + this.serverId + "/volumes", { attach: true, volume: this.volume })
                .then(async response => {
                    this.dialog = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return this.run();
                        case false:
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