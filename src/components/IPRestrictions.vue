<template>
    <v-card>
        <v-card-text>
            <v-alert v-if="error" type="error" :text="error"></v-alert>

            <v-switch v-model="data.active" label="IP restrictions" @change="toggle" color="primary"
                hide-details></v-switch>

            <div v-if="data.active">
                <v-list max-width="300">
                    <v-list-item v-for="(item, i) in items" :key="`item-${i}`" :title="item.ip" :subtitle="item.label">
                        <template v-slot:append>
                            <v-btn icon :disabled="fetching" :loading="loading === item.line" @click.stop="deleteItem(item.line)">
                                <v-icon size="small">mdi:mdi-delete</v-icon>
                            </v-btn>
                        </template>
                    </v-list-item>
                </v-list>

                <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
            </div>

            <v-dialog app v-model="drawer" temporary right max-width="600">
                <v-card title="IP">
                    <v-form v-model="valid">
                        <v-card-text>
                            <v-text-field v-model="item.label" label="Label" required
                                :rules="[rules.required]" placeholder="Home"></v-text-field>
                            <IP label="IP" :remoteAddr="remoteAddr" v-model="item.ip" />

                            <v-btn :disabled="!valid" :loading="fetching" color="success" @click="saveItem">
                                Save
                            </v-btn>
                        </v-card-text>
                    </v-form>
                </v-card>
            </v-dialog>

            <Confirm ref="confirm" />
        </v-card-text>
    </v-card>
</template>

<script>
import api from "../services/api";
import Confirm from "./ConfirmDialog.vue";
import IP from "./IP.vue";

export default {
    components: {
        Confirm,
        IP,
    },
    props: {
        serverId: null,
        active: null,
        items: null,
        path: null,
        remoteAddr: null,
    },
    data() {
        return {
            data: {
                active: null,
            },
            item: {},
            loading: null,
            fetching: false,
            drawer: false,
            rules: {
                required: (value) => !!value || "Required.",
                ip: (v) =>
                    !v ||
                    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                        v
                    ) ||
                    "Invalid IP address",
            },
            error: null,
            valid: false
        };
    },

    watch: {
        active: function (newVal) {
            this.data.active = newVal;
        },
    },

    methods: {
        toggle() {
            var self = this;
            this.fetching = true;
            this.error = "";

            api
                .post(this.path, {
                    active: this.data.active,
                })
                .then(function (response) {
                    console.log(response);

                    if (!response.data.success) {
                        self.error = response.data.error;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.fetching = false;
                    self.$emit("save");
                });
        },
        addItem() {
            this.item = {};
            this.drawer = true;
        },
        deleteItem: async function (line) {
            if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
                return;
            }

            var self = this;
            this.loading = line;
            this.error = "";

            api
                .post(this.path, { line: line })
                .then(function (response) {
                    console.log(response);

                    if (!response.data.success) {
                        self.error = response.data.error;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(() => {
                    this.loading = null;
                    self.$emit("save");
                });
        },
        saveItem() {
            var self = this;
            this.error = "";
            this.fetching = true;

            api
                .post(this.path, this.item)
                .then(response => {
                    console.log(response);
                    if (response.data.error) {
                        self.error = response.data.error;
                    } else {
                        self.drawer = false;
                        self.$emit("save");
                    }
                })
                .catch(error => console.log(error))
                .finally(() => {
                    this.fetching = false;
                });
        }
    },
};
</script>