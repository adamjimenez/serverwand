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
            this.error = "";
            this.siteId = this.$route.params.id;
            clearTimeout(this.timer);
            this.fetching = true;

            api
                .get("sites/" + this.siteId + "/dns", {
                    clearCacheEntry: clearCacheEntry,
                })
                .then((response) => {
                    console.log(response);
                    this.data = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.fetching = false;
                });
        },
        fixDomainDns() {
            this.error = "";
            this.loading = true;

            api
                .post("sites/" + this.siteId + "/fixdns", {})
                .then(async (response) => {
                    console.log(response);
                    this.loading = false;

                    switch (await this.$refs.oauth.check(response.data)) {
                        case true:
                            return this.fixDomainDns();
                        case false:
                            return;
                    }

                    if (!response.data.success) {
                        this.error = response.data.error;
                    } else {
                        this.fetchData(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>