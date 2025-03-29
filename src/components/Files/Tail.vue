<template>
    <div v-if="selected?.length === 1 && selected[0].type === 'file'">
        <v-btn @click="tail()" :disabled="!selected" title="Tail" icon>
            <v-icon>mdi:mdi-format-align-bottom</v-icon>
        </v-btn>

        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-dialog v-model="dialog" fullscreen>
            <v-card :loading="fetching" style="height: 95vh;">

                <v-toolbar :title="data.id">
                    <template v-slot:append>
                        <v-btn @click="dialog = false" icon="mdi:mdi-close"></v-btn>
                    </template>
                </v-toolbar>

                <v-card-text>
                    <MonacoEditor class="editor" ref="editor" :language="language" v-model:value="data.content"
                        theme="vs-dark" />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import api from "../../services/api";
import MonacoEditor from "monaco-editor-vue3";

export default {
    components: {
        MonacoEditor,
    },

    props: {
        serverId: null,
        path: null,
        selected: null,
    },

    watch: {
        path: function (newVal) {
            this.data.path = newVal;
        },
        selected: function (newVal) {
            this.data.selected = newVal;
        }
    },

    data() {
        return {
            fetching: false,
            data: {
                path: '',
                selected: []
            },
            error: "",
            dialog: false,
            language: 'javascript'
        };
    },

    methods: {
        basename(path) {
            return path.split(/[\\/]/).pop();
        },
        tail() {
            this.$emit("loading", true);

            let item = this.selected[0];

            return api
                .post("servers/" + this.serverId + '/files', {
                    cmd: 'tail',
                    id: item.id,
                })
                .then(response => {
                    console.log(response);

                    if (response.data.success !== false) {
                        this.data.id = item.id;
                        this.data.file = this.basename(item.id);
                        this.data.content = response.data.content;
                        this.dialog = true;

                        // set language
                        //this.setLanguage();
                    } else {
                        this.$emit("error", response.data.error);
                    }
                })
                .catch(error => console.log(error))
                .finally(() => {
                    this.fetching = false;
                    this.$emit("loading", false);
                });
        },
    },
};
</script>