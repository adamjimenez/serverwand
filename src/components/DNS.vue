<template>
    <div>
        <v-list-item v-if="!data.dns || data.dns?.updating" class="mb-3">
            <strong>Checking DNS..</strong>
        </v-list-item>

        <v-list-item v-else-if="data.dns?.A != server.ip" title="DNS mismatch"
            :subtitle="(data.dns?.A ? data.dns?.A : 'blank') + ' != ' + server.ip">

            <template v-slot:append>
                <v-btn v-if="data.dns?.not_set" @click="fixDomainDns(data.domain)" title="Fix" icon="fas fa-hammer" size="small"></v-btn>
            </template>
        </v-list-item>
        <OAuth ref="oauth" />
    </div>
</template>
  
<script>
import api from "../services/api";
import OAuth from "./OAuth.vue";

export default {
    components: {
        OAuth,
    },

    props: {
        server: null,
    },

    data() {
        return {
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
                .then(async function (response) {
                    console.log(response);
                    self.loading = false;

                    switch (await self.$refs.oauth.check(response.data)) {
                        case true:
                            return self.fixDomainDns();
                        case false:
                            return;
                    }

                    if (!response.data.success) {
                        self.error = response.data.error;
                    } else {
                        self.fetchData(true);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
    },
};
</script>