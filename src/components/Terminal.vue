<template>
    <div class="d-flex align-center justify-end h-100">
        <v-btn @click="terminal" v-bind="$attrs" :disabled="!serverId || fetching">
            <slot></slot>
        </v-btn>

        <v-dialog v-model="chooseUser">
            <v-card :loading="fetching">
                <v-card-title> Open Secure Shell </v-card-title>

                <v-card-text>
                    <v-alert color="error" v-if="error" class="mb-3">
                        <div v-html="error"></div>
                    </v-alert>

                    <div v-if="users.length">
                        <v-select v-model="ssh_username" :items="users" label="User"></v-select>

                        <v-btn :disabled="ssh_username.length === 0" color="success" @click="saveKeyAndContinue" right
                            class="ml-3">
                            Save Key and Continue
                        </v-btn>
                    </div>

                    <div v-else-if="!fetching">
                        No system users, add one and try again.
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import api from "../services/api";

export default {
    props: {
        cmd: null,
    },
    data() {
        return {
            error: "",
            data: {
                users: {},
            },
            ssh_username: "",
            users: [],
            details: "",
            fetching: false,
            chooseUser: false,
        };
    },
    created() {
        this.fetchData();
    },
    watch: {
        // call again the method if the route changes
        $route: "fetchData",
    },
    methods: {
        fetchData() {
            this.error = "";
            this.fetching = true
            this.serverId = this.$route.params.id;

            if (!this.serverId) {
                return;
            }

            api
                .get("servers/" + this.serverId)
                .then(response => {
                    console.log(response);

                    if (response.data.error) {
                        this.error = response.data.error;
                    }

                    if (response.data.item) {
                        this.data = response.data.item;
                        window.server = this.data;
                    }
                })
                .catch(error => console.log(error))
                .finally(() => this.fetching = false);
        },
        fetchUsers() {
            this.error = "";
            this.fetching = true;
            this.chooseUser = true;

            api
                .get("servers/" + this.serverId + "/systemusers")
                .then(response => {
                    console.log(response);

                    if (response.data.error) {
                        this.error = response.data.error;
                        return false;
                    }

                    response.data.item.users.forEach((element) => {
                        this.users.push({
                            title: element.name,
                            value: element.name,
                        });
                    });
                })
                .catch(error => console.log(error))
                .finally(() => this.fetching = false);
        },
        saveKey(key) {
            // save key
            api
                .post(
                    "servers/" + this.serverId + "/systemusers/" + this.ssh_username,
                    { key: key }
                )
                .then(response => {
                    console.log(response);

                    if (!response.data.success) {
                        this.fetching = false;
                        this.error = response.data.error;
                    } else {
                        this.saveSSHUser();
                    }
                })
                .catch(error => {
                    this.fetching = false;
                    console.log(error);
                });
        },
        saveSSHUser() {
            this.fetching = true;
            api
                .post("servers/" + this.serverId + "/savesshuser", {
                    ssh_username: this.ssh_username,
                })
                .then(response => {
                    console.log(response);

                    if (!response.data.success) {
                        this.error = response.data.error;
                    } else {
                        this.data.ssh_username = this.ssh_username;
                        this.chooseUser = false;
                        this.terminal();
                    }
                })
                .catch(error => console.log(error))
                .finally(() => {
                    this.fetching = false;
                });
        },
        saveKeyAndContinue() {
            this.fetching = true;

            // get ssh key
            api
                .post("https://shiftedit.net/api/prefs")
                .then(response => {
                    console.log(response);

                    if (response.data.error) {
                        this.error = response.data.error;
                    } else {
                        console.log(response.data.public_key);
                        this.saveKey(response.data.public_key);
                    }
                })
                .catch(error => console.log(error))
                .finally(() => {
                    this.fetching = false;
                });
        },
        terminal() {
            if (this.data.ssh_username) {
                console.log("open ssh " + this.data.ssh_username);

                var url =
                    "http://shiftedit.net/ssh/?host=" +
                    this.data.hostname +
                    "&user=" +
                    this.data.ssh_username;

                if (this.cmd) {
                    url += '&cmd=' + encodeURIComponent(this.cmd);
                }

                if (window.ssh_path) {
                    url += "&path=" + window.ssh_path;
                }

                window.open(url);
            } else {
                this.fetchUsers();
            }
        },
    },
};
</script>
