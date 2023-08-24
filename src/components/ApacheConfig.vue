<template>
    <span>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn icon @click="edit()">
                    <v-icon small>fas fa-wrench</v-icon>
                </v-btn>
            </template>
            <span>Configure Apache</span>
        </v-tooltip>

        <v-dialog v-model="drawer" scrollable max-width="600">
            <v-card>
                <v-card-title> Edit Apache config </v-card-title>

                <v-card-text>
                    <v-list group>
                        <template v-for="(item, i) in items" :key="`item-${i}`">
                            <v-list-item :value="item">
                                <v-switch v-model="item.active" :label="item.name" color="primary"
                                    hide-details></v-switch>
                            </v-list-item>
                        </template>
                    </v-list>
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
            items: [],
            data: [],
            drawer: false,
        };
    },

    computed: {
        changed: function () {
            return JSON.stringify(this.data) !== JSON.stringify(this.items);
        }
    },

    methods: {
        edit() {
            var self = this;
            this.fetching = true;

            api
                .get("servers/" + this.serverId + "/apache", {
                    clearCacheEntry: true,
                })
                .then(response => {
                    self.data = JSON.parse(JSON.stringify(response.data.config));
                    self.items = JSON.parse(JSON.stringify(response.data.config));
                    self.fetching = false;
                    self.drawer = true;
                });
        },

        save() {
            var self = this;
            this.fetching = true;
            
            // get changes
            let changes = {};
            this.items.forEach(function (val) {
                self.data.forEach(function (old) {
                    if (val.name === old.name && val.active !== old.active) {
                        changes[val.name] = val.active;
                    }
                });
            });

            api
                .post("servers/" + this.serverId + "/apache", {
                    config: changes,
                })
                .then(() => {
                    self.fetching = false;
                    self.drawer = false;
                });
        },
    },
};
</script>