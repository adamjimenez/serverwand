<template>
    <div>
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-card :loading="fetching">
            <v-card-actions>
                <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
                <v-btn :disabled="fetching" :loading="loading === 'update'" @click.stop="update()" icon="mdi:mdi-download" title="Composer update"></v-btn>
            </v-card-actions>
            <v-list max-width="600">
                <v-list-item v-for="(item, i) in data.item?.packages" :key="`item-${i}`" :title="item.name"
                    :subtitle="item.version + (item.version != item.latest ? ' -> ' + item.latest : '')" @click="viewItem(item)">
                    <template v-slot:append>
                        <v-btn v-if="item.version != item.latest" :disabled="fetching" :loading="loading === 'upgrade ' + item.name" @click.stop="updateItem(item)"
                            icon="mdi:mdi-download" size="small" :title="'Upgrade to ' + item.latest"></v-btn>
                        <v-btn :disabled="fetching" :loading="loading === 'delete ' + item.name" @click.stop="deleteItem(item)"
                            icon="mdi:mdi-delete" size="small" title="Remove"></v-btn>
                    </template>
                </v-list-item>
            </v-list>
        </v-card>

        <v-dialog v-model="addDialog" max-width="600" persistent>
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <div class="text-h5 text-medium-emphasis ps-2">
                        Add package
                    </div>

                    <v-btn icon="mdi:mdi-close" variant="text" @click="addDialog = false"></v-btn>
                </v-card-title>
                <v-form v-model="valid" ref="form">
                    <v-card-text>
                        <v-text-field v-model="item.name" label="Name"></v-text-field>

                        <v-btn :disabled="!valid" :loading="loading === 'save'" color="success" @click="saveItem">
                            Save
                        </v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-dialog>

        <v-dialog v-model="viewDialog" max-width="600">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <div class="text-h5 text-medium-emphasis ps-2">
                        {{ item.name }}
                    </div>

                    <v-btn icon="mdi:mdi-close" variant="text" @click="viewDialog = false"></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-list>
                        <v-list-item v-if="item.description" title="Description" :subtitle="item.description"></v-list-item>
                        <v-list-item title="Source" :subtitle="item.source"></v-list-item>
                        <v-list-item title="Version" :subtitle="item.version"></v-list-item>
                        <v-list-item title="Latest" :subtitle="item.latest"></v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>

        <Confirm ref="confirm" />
    </div>
</template>

<script>
import api from "../../services/api";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
    components: {
        Confirm,
    },
    data() {
        return {
            error: "",
            fetching: false,
            loading: null,
            addDialog: false,
            viewDialog: false,
            data: {
                users: {},
            },
            item: {
                name: "",
                value: "",
            },
            variables: [],
            rules: {
                required: (value) => !!value || "Required.",
                alphanumeric: (v) =>
                    /^[a-zA-Z0-9-_!\.]+$/g.test(v) || "Must contain alphanumeric characters only",
            },
            valid: false,
        };
    },
    created() {
        this.siteId = this.$route.params.id;
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.error = "";
            this.fetching = true;

            api
                .get("sites/" + this.siteId + "/composer")
                .then((response) => {
                    console.log(response);

                    if (response.data.error) {
                        this.error = response.data.error;
                        return false;
                    }

                    this.data = response.data;
                    document.title = "Composer" + " | " + this.data.item.name;
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.fetching = false;
                });
        },
        addItem() {
            this.item = {};
            this.addDialog = true;
        },
        viewItem(item) {
            this.item = { ...item };
            this.viewDialog = true;
        },
        update: async function (item) {
            if (!await this.$refs.confirm.open("Update?")) {
                return;
            }

            this.loading = 'update';
            this.error = "";

            api
                .post("sites/" + this.siteId + "/composer", { update: 1 })
                .then((response) => {
                    console.log(response);

                    if (!response.data.success) {
                        this.fetching = false;
                        this.error = response.data.error;
                    } else {
                        this.fetchData();
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.loading = null;
                });
        },
        updateItem: async function (item) {
            if (!await this.$refs.confirm.open("Update package?")) {
                return;
            }

            this.loading = 'upgrade ' + item.name;
            this.error = "";

            api
                .post("sites/" + this.siteId + "/composer", { upgrade: item.name })
                .then((response) => {
                    console.log(response);

                    if (!response.data.success) {
                        this.fetching = false;
                        this.error = response.data.error;
                    } else {
                        this.fetchData();
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.loading = null;
                });
        },
        deleteItem: async function (item) {
            if (!await this.$refs.confirm.open("Remove package?")) {
                return;
            }

            this.loading = 'remove ' + item.name;
            this.error = "";

            api
                .post("sites/" + this.siteId + "/composer", { remove: item.name })
                .then((response) => {
                    console.log(response);

                    if (!response.data.success) {
                        this.fetching = false;
                        this.error = response.data.error;
                    } else {
                        this.fetchData();
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.loading = null;
                });
        },
        saveItem: async function () {
            this.error = "";

            if (this.$refs.form.validate()) {
                this.loading = 'save';
                const result = await api.post("sites/" + this.siteId + "/composer", {require: this.item.name});

                if (result.data.error) {
                    this.error = result.data.error;
                } else {
                    this.drawer = false;
                    this.fetchData();
                }

                this.loading = null;
            }
        },
    },
};
</script>