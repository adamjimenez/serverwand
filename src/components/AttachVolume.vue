<template>
    <span>
        <v-btn icon @click="open()" title="Attach Volume">
            <v-icon size="small">mdi:mdi-plus</v-icon>
        </v-btn>

        <v-dialog app scrollable v-model="dialog">
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
            var self = this;
            this.dialog = true;
            this.fetching = true;

            api
                .get("servers/" + this.serverId + "/volumes", { clearCacheEntry: true })
                .then(async response => {
                    self.fetching = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return self.open();
                        case false:
                            return;
                    }

                    self.items = response.data.available;
                });
        },

        run() {
            var self = this;
            this.error = null;
            this.fetching = true;

            api
                .post("servers/" + this.serverId + "/volumes", { attach: true, volume: this.volume })
                .then(async response => {
                    self.dialog = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return self.run();
                        case false:
                            return;
                    }

                    if (response.data.error) {
                        self.dialog = true;
                        this.error = response.data.error;
                        return;
                    }

                    self.$emit('complete');
                })
                .finally(() => {
                    self.fetching = false;
                });
        },
    },
};
</script>