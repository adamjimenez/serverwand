<template>
    <div style="width: 100%;" v-if="data.items?.length">

        <v-row class="mb-3">
            <v-col cols="12" lg="2" xl="1">
                <v-list v-if="$vuetify.display.lgAndUp" v-model:selected="resource" class="mt-5">
                    <v-list-item v-for="item in resourceOptions" :key="item.title" :value="item.value">
                        {{ item.title }}
                    </v-list-item>
                </v-list>
                <v-select v-else v-model="resource" :items="resourceOptions" hide-details></v-select>

                <v-list v-if="$vuetify.display.lgAndUp" v-model:selected="daysAgo">
                    <v-list-item v-for="item in data.items" :key="item.title" :value="item.value">
                        {{ item.title }}
                    </v-list-item>
                </v-list>
                <v-select v-else  v-model="daysAgo" :items="data.items" hide-details></v-select>
            </v-col>

            <v-col>
                <svg width="100%" :viewBox="'0 0 1000 ' + (graphHeight[resource] ? graphHeight[resource] : '300')" v-html="data.graph" style="max-width: 2400px;"></svg>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import api from "../services/api";

export default {
    props: {
        serverId: null,
    },
    data() {
        return {
            resource: 'u',
            resourceOptions: [{
                title: 'CPU',
                value: 'u',
            }, {
                title: 'Memory',
                value: 'r',
            }, {
                title: 'I/O',
                value: 'b',
            }, {
                title: 'Disk',
                value: 'd',
            }, {
                title: 'Swap',
                value: 'S',
            }],
            daysAgo: 0,
            data: {
                items: [{
                    title: 'Today',
                    value: 0
                }]
            },
            graphHeight: {
                d: 1600,
            },
            timer: null,
            error: null,
        };
    },
    methods: {
        load() {
            api
                .get("servers/" + this.serverId + "/graph?days_ago=" + this.daysAgo + '&resource=' + this.resource)
                .then(response => {
                    this.data = response.data;
                })
                .catch(error => this.error = error.message);
        },
        refresh() {
            if (this.daysAgo === 0) {
                console.log('refresh graph');
                this.daysAgo = [0];
            }

            // refresh after an interval
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.refresh();
            }, 1 * 60 * 1000);
        }
    },
    watch: {
        resource: 'load',
        daysAgo: 'load',
    },
    created() {
        this.refresh();
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
};
</script>