<template>
    <span>
        <v-btn icon @click="edit()">
            <v-icon size="small">fas fa-wrench</v-icon>
        </v-btn>

        <v-dialog v-model="drawer" max-width="600">
            <v-card title="Edit Postfix config">
                <v-card-text>
                    <v-text-field v-for="(item, i) in config" :key="`item-${i}`" :label="item.name" v-model="item.value"
                        :type="isNaN(item.value) ? 'text' : 'number'"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn :disabled="!changed" :loading="fetching" color="success" @click="save" variant="flat">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </span>
</template>
  
<script>
import api from "../services/api";

export default {
    props: {
        serverId: null,
    },
    data() {
        return {
            fetching: false,
            data: [],
            config: [],
            drawer: false,
        };
    },
    computed: {
        changed: function () {
            return JSON.stringify(this.data) !== JSON.stringify(this.config);
        }
    },
    methods: {
        edit() {
            this.fetching = true;

            api
                .get("servers/" + this.serverId + "/postfix", {
                    clearCacheEntry: true,
                })
                .then(response => {
                    this.data = JSON.parse(JSON.stringify(response.data.config));
                    this.config = JSON.parse(JSON.stringify(response.data.config));
                    this.fetching = false;
                    this.drawer = true;
                });
        },

        save() {
            this.fetching = true;

            // get changes
            let changes = {};
            this.config.forEach((val) => {
                this.data.forEach((old) => {
                    if (val.name === old.name && val.value !== old.value) {
                        changes[val.name] = val.value;
                    }
                });
            });

            api
                .post("servers/" + this.serverId + "/postfix", {
                    config: changes,
                })
                .then(() => {
                    this.fetching = false;
                    this.drawer = false;
                });
        },
    },
};
</script>