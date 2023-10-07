<template>
    <v-dialog v-model="dialog" :max-width="options.width" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel" persistent>
        <v-card>
            <v-toolbar dark :color="options.color" dense flat>
                <v-toolbar-title class="text-body-2 font-weight-bold grey--text">
                    Permission Required
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text v-show="!!message" class="pa-4 black--text" v-html="message"></v-card-text>
            <v-card-actions class="pt-3">
                <v-spacer></v-spacer>
                <v-btn v-if="!options.noconfirm" color="grey" text class="body-2 font-weight-bold"
                    @click="cancel">Cancel</v-btn>
                <v-btn color="primary" class="body-2 font-weight-bold" outlined @click="open">Review Permissions</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data: function () {
        return {
            provider: null,
            dialog: false,
            resolve: null,
            reject: null,
            message: null,
            title: null,
            options: {
                color: "grey lighten-3",
                width: 400,
                zIndex: 10008,
                noconfirm: false
            },
            window: null,
            timeout: null,
        };
    },
    methods: {
        check(data) {
            if (data.error !== 'auth') {
                return;
            }

            this.provider = data.provider;
            this.dialog = true;

            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        agree() {
            this.resolve(true);
            this.dialog = false;
        },
        cancel() {
            this.resolve(false);
            this.dialog = false;
        },
        open() {
            var self = this;
            var popup = window.open("https://serverwand.com/account/services/" + this.provider);

            function checkIfPopupWindowClosed() {
                clearTimeout(self.timer);

                if (popup.closed) {
                    return self.agree();
                }

                self.timer = setTimeout(checkIfPopupWindowClosed, 1000);
            }

            checkIfPopupWindowClosed();
        }
    },
    watch: {
        "window.closed": function (newVal) {
            console.log(newVal);
            if (newVal === false) {
                //this.agree();
            }
        }
    }
};
</script>