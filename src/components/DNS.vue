<template>
    <div>
        <v-list-item v-if="!data.dns || data.dns?.updating" class="mb-3">
            <strong>Checking DNS..</strong>
        </v-list-item>

        <v-list-item v-else-if="!authRequired && data.dns?.A != server.ip" title="DNS mismatch" :subtitle="(data.dns?.A ? data.dns?.A : 'blank') + ' != ' + server.ip">
            <v-btn v-if="data.dns?.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
        </v-list-item>
    </div>
</template>
  
<script>
import api from "../services/api";
export default {
    props: {
        server: null,
    },

    data() {
        return {
            authRequired: false,
            data: {},
            fetching: false
        };
    },

    created() {
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData();
    },

    methods: {
        fetchData(clearCacheEntry) {
            var self = this;
            this.error = "";
            this.siteId = this.$route.params.id;
            clearTimeout(self.timer);
            this.fetching = true;

            api
                .get("sites/" + this.siteId + "/dns", {
                    clearCacheEntry: clearCacheEntry,
                })
                .then(function (response) {
                    console.log(response);
                    self.data = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.fetching = false;
                });
        },
        fixDomainDns() {
            var self = this;
            this.error = "";
            this.loading = true;

            api
                .post("sites/" + self.siteId + "/fixdns", {})
                .then(function (response) {
                    console.log(response);

                    self.loading = false;

                    if (!response.data.success) {
                        if (response.data.error == "auth") {
                            self.authRequired = true;
                        } else {
                            self.error = response.data.error;
                        }
                    } else {
                        self.fetchData(true);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        authPrompt() {
            this.authRequired = false;
            window.open(
                "https://serverwand.com/account/services/" + this.data.server.dns
            );
        },
        toggleAuth() {
            var self = this;
            this.fetching = true;
            this.error = "";

            api
                .post("sites/" + this.siteId + "/auth", {
                    status: this.data.auth.active,
                })
                .then(function (response) {
                    console.log(response);

                    if (!response.data.success) {
                        self.error = response.data.error;
                    } else {
                        self.fetchData(true);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.fetching = false;
                });
        },
    },
};
</script>