<template>
    <div>
        <v-alert v-if="error" type="error">
          {{ error }}
        </v-alert>

        <v-switch v-model="data.active" label="IP restrictions" @change="toggle" class="mx-3"></v-switch>
        
        <div v-if="data.active">
            <v-list>
                <v-list-item-group>
                    <template v-for="(item, i) in items">
                        <v-list-item :key="`item-${i}`" :value="item">
                            <template v-slot:default>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ item.ip }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ item.label }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>

                                <v-list-item-action>
                                    <v-btn icon :disabled="fetching" :loading="fetching" @click="deleteItem(item.line)">
                                        <v-icon small>delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-list>

            <v-card>
                <div>
                    <v-card-title primary-title>
                        <v-btn @click="addItem()">
                            Add IP
                        </v-btn>
                    </v-card-title>
                </div>
            </v-card>
        </div>

        <v-navigation-drawer app v-model="drawer" temporary right>
            <v-card>
                <v-form ref="form">
                    <v-card-title> IP </v-card-title>

                    <v-card-text>
                        <v-text-field v-model="item.label" label="Label" required></v-text-field>

                        <v-text-field v-model="item.ip" label="IP address" required :rules="[rules.ip]"></v-text-field>

                        <v-btn :disabled="fetching" :loading="fetching" color="success" @click="saveItem">
                            Save
                        </v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-navigation-drawer>

    </div>
</template>

<script>
import api from "../services/api";

export default {
    props: {
        serverId: null,
        active: null,
        items: null,
        path: null,
    },
    data() {
        return {
            data: {
                active: null,
            },
            item: {},
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
        deleteItem(line) {
            this.$confirm("Delete IP?").then((res) => {
                if (res) {
                    var self = this;
                    this.fetching = true;
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
                            this.fetching = false;
                            self.$emit("save");     
                        });
                }
            });
        },
        saveItem() {
            var self = this;
            this.error = "";

            if (this.$refs.form.validate()) {
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
    },
};
</script>