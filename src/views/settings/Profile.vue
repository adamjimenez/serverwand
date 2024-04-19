<template>
  <div>
    <v-card max-width="600">
      <v-card-text>
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-text-field v-model="data.edition" label="Edition" disabled readonly></v-text-field>

        <v-text-field v-model="data.email" :rules="usernameRules" label="Email" disabled required></v-text-field>

        <v-expansion-panels>
          <v-expansion-panel v-model="passwordPanel" expand title="Change password">
            <v-expansion-panel-text>
              <v-card tile flat>
                <v-card-text>
                  <v-text-field type="password" v-model="data.password" :rules="passwordRules" label="Password"
                    required></v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="validate">Submit</v-btn>
                </v-card-actions>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-checkbox v-model="data.emails" label="Receive email updates" @change="toggleEmails()"></v-checkbox>

        <v-checkbox v-model="useMasterPassword" label="Use a master password"
          @change="toggleMasterPassword()"></v-checkbox>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="changeMasterPassword()" :disabled="!useMasterPassword">Change master password</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="masterPasswordDialog" persistent max-width="600">
      <v-card title="Master password">
        <v-card-text>
          <p>A Master Password is used to protect your server keys</p>

          <v-text-field v-model="mp.current" type="password" label="Current password" required autocomplete="new-password"
            :disabled="!data.prefs.useMasterPassword"></v-text-field>

          <v-text-field v-model="mp.password" type="password" label="Enter new password" required
            autocomplete="new-password"></v-text-field>

          <v-text-field v-model="mp.confirm" type="password" label="Re-enter password" required
            autocomplete="new-password"></v-text-field>

          <p>
            Please make sure you remember the Master Password you have set. If
            you forget your Master Password you will be unable to access any of
            the information protected by it.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="masterPasswordDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" @click="saveMasterPassword()" :disabled="!mp.password ||
            mp.password != mp.confirm ||
            (data.prefs.useMasterPassword && !mp.current)
            ">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removePasswordDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Remove master password</span>
        </v-card-title>
        <v-card-text>
          <p>Once removed your passwords will no longer be protected</p>

          <v-text-field v-model="mp.password" type="password" label="Current password" required
            browser-autocomplete="new-password"></v-text-field>

          <v-checkbox v-model="mp.forceRemove" label="Force remove password (will lose existing passwords)"></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="removePasswordDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" @click="removeMasterPassword()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../../services/api";
import { sha256 } from "js-sha256";

export default {
  data: () => ({
    valid: true,
    mp: {
      current: "",
      password: "",
      confirm: "",
    },
    data: {
      edition: "",
      email: "",
      password: "",
      prefs: {},
    },
    usernameRules: [(v) => !!v || "Email is required"],
    passwordRules: [],
    loading: false,
    error: "",
    useMasterPassword: false,
    masterPasswordDialog: false,
    removePasswordDialog: false,
    passwordPanel: [false],
  }),

  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    document.title = "Profile";
    this.fetchData();
  },

  methods: {
    fetchData() {
      this.error = "";
      this.loading = true;

      api
        .get("settings/profile")
        .then((response) => {
          console.log(response);
          this.data = response.data.profile;
          this.useMasterPassword = this.data.prefs.useMasterPassword;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.dialog = true;

        api
          .post("settings/profile", this.data)
          .then((response) => {
            console.log(response);
            if (response.data.success) {
              this.$router.push("/");
            } else {
              this.error = response.data.error;
            }
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            this.dialog = false;
            this.loading = false;
          });
      }
    },
    changeMasterPassword() {
      this.masterPasswordDialog = true;
    },
    toggleMasterPassword() {
      this.useMasterPassword = this.data.prefs.useMasterPassword;

      if (this.useMasterPassword) {
        this.removePasswordDialog = true;
      } else {
        this.masterPasswordDialog = true;
      }
    },
    saveMasterPassword() {
      this.masterPasswordDialog = false;
      this.loading = true;

      var masterPassword = sha256(this.mp.current);
      var newMasterPassword = sha256(this.mp.password);

      api
        .post("settings/savemasterpassword", {
          useMasterPassword: 1,
          masterPassword: masterPassword,
          newMasterPassword: newMasterPassword,
        })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            this.fetchData();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.dialog = false;
          this.loading = false;
        });

      //this.fetchData()
    },
    removeMasterPassword() {
      this.removePasswordDialog = false;
      this.loading = true;
      let masterPassword = "";

      if (this.mp.password) {
        masterPassword = sha256(this.mp.password);
      }

      api
        .post("settings/removemasterpassword", {
          masterPassword: masterPassword,
          forceRemove: this.mp.forceRemove,
        })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            this.fetchData();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });

      //this.fetchData()
    },
    toggleEmails() {
      this.loading = true;

      api
        .post("settings/profile", {
          emails: this.data.emails,
        })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            this.fetchData();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>