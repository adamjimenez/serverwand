<template>
    <div style="width: 100%;">
        <v-row>
            <v-col>
                <v-select v-model="daysAgo" :items="data.items" @update:modelValue="load" hide-details></v-select>
            </v-col>
            <v-col>
                <v-select v-model="resource" :items="resourceOptions" @update:modelValue="load" hide-details></v-select>
            </v-col>
        </v-row>
        <svg width="100%" :viewBox="'0 0 1060 ' + (graphHeight[resource] ? graphHeight[resource] : '400')" v-html="data.graph"></svg>
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
            resourceOptions: [
                {
                    title: 'CPU',
                    value: 'u',
                },
                {
                    title: 'Memory',
                    value: 'r',
                },
                {
                    title: 'Disk',
                    value: 'd',
                },
                {
                    title: 'Swap',
                    value: 's',
                },
            ],
            daysAgo: 0,
            data: {},
            graphHeight: {
                r: 1600,
                d: 1600,
            }
        };
    },

    methods: {
        load() {
            var self = this;

            api
                .get("servers/" + this.serverId + "/graph?days_ago=" + this.daysAgo + '&resource=' + this.resource)
                .then(response => {
                    self.data = response.data;
                });
        },
    },
    created() {
        this.load();
    },
};
</script>