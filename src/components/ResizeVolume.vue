<template>
    <span>
        <v-dialog app scrollable v-model="dialog" max-width="600">
            <v-alert v-if="error" type="error" :text="error"></v-alert>

            <v-card :loading="fetching" title="Resize Volume">

                <v-card-text>
                    <v-text-field type="number" v-model="size" :min="min" suffix="GB"></v-text-field>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn @click="run()" :disabled="size === min" color="success" :loading="fetching">
                        Resize
                    </v-btn>
                </v-card-actions>

                <v-alert v-if="msg" type="info" :text="msg"></v-alert>
            </v-card>
        </v-dialog>

        <v-btn icon @click="open()" title="Resize Volume">
            <v-icon size="small">mdi:mdi-pencil</v-icon>
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
            size: 0,
            min: 0,
            fetching: false,
            dialog: false,
            error: null,
            items: [],
            msg: '',
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

                    this.items = response.data.volumes;
                    console.log(response.data.volumes);

                    response.data?.volumes.forEach(volume => {
                        if ('/mnt/' + volume.name === this.volume) {
                            this.size = volume.size;
                            this.min = volume.size;
                        }
                    });
                });
        },

        async run() {
            if (!await this.$refs.confirm.open("Resize " + this.volume, 'The server will be shutdown in order to avoid data-loss and will be restarted when done.')) {
                return;
            }

            this.dialog = true;
            this.error = null;
            this.fetching = true;

            api.event(
                'servers/' + this.serverId + '/volumes/resize?volume=' + encodeURIComponent(this.volume) + '&size=' + encodeURIComponent(this.size),
                result => {
                    this.msg = result.msg;
                },
                error => this.error = error,
                () => {
                    this.msg = '';
                    this.fetching = false;

                    if (!this.error) {
                        this.dialog = false;
                        this.$emit("complete");
                    }
                }
            );
        },
    },
};
</script>