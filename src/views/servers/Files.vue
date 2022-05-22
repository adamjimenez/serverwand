<!--
extract zip
-->

<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-alert
      v-if="dragover"
      type="info"
      style="position: fixed; height: 80px; z-index: 10; bottom: 0; left: 50%"
    >
      Drop files to upload them to:
      <p>
        <strong>{{ path }}</strong>
      </p>
    </v-alert>

    <Loading :value="loading" />

    <EditFile
      ref="editFile"
      :serverId="serverId"
      :path="path"
      :selected="selected"
      action="files"
      @complete="fetchData()"
      @error="handleError"
    />

    <v-card :loading="fetching">
      <v-container>
        <v-row>
          <v-col class="flex-grow-0">
            <NewFile
              :serverId="serverId"
              :path="path"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>
          <v-col class="flex-grow-0">
            <NewFolder
              :serverId="serverId"
              :path="path"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>
          <Upload
            :serverId="serverId"
            :path="path"
            :results="$refs.results"
            @complete="fetchData()"
            @error="handleError"
            @progress="handleProgress"
          />
          <v-col class="flex-grow-0" v-if="selected.length === 1">
            <Rename
              :serverId="serverId"
              :path="path"
              :selected="selected"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>
          <v-col class="flex-grow-0" v-if="selected.length">
            <DeleteFiles
              :serverId="serverId"
              :path="path"
              :selected="selected"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>
          <v-col class="flex-grow-0" v-if="selected.length">
            <Chmod
              :serverId="serverId"
              :path="path"
              :selected="selected"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>
          <v-col class="flex-grow-0" v-if="selected.length">
            <Chown
              :serverId="serverId"
              :path="path"
              :selected="selected"
              @complete="fetchData()"
              @error="handleError"
            />
          </v-col>

          <Extract 
            :serverId="serverId" 
            :path="path" 
            :selected="selected" 
            @complete="fetchData"
            @error="handleError"
            @loading="handleLoading"
            />

          <v-col
            class="flex-grow-0"
            v-if="selected.length === 1 && selected[0].type === 'file'"
          >
            <Download :serverId="serverId" :path="path" :selected="selected" />
          </v-col>

          <Clipboard
            :serverId="serverId"
            :path="path"
            :selected="selected"
            @complete="fetchData()"
            @error="handleError"
          />
        </v-row>
      </v-container>

      <v-container>
        <v-row>
          <v-col class="flex-grow-0">
            <v-btn icon @click="upLevel()" :disabled="path === '/'">
              <v-icon small>arrow_upward</v-icon>
            </v-btn>
          </v-col>

          <v-col class="flex-grow-0">
            <v-btn icon @click="fetchData()">
              <v-icon small>refresh</v-icon>
            </v-btn>
          </v-col>

          <v-col>
            <v-text-field
              v-model="path"
              class="ma-0 pa-0"
              @change="fetchData"
              @keydown.enter="fetchData"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-data-table
        :headers="headers"
        :items="items"
        class="results"
        ref="results"
      >
        <template v-slot:body="prop">
          <tbody>
            <tr v-for="item in prop.items" :key="item.name">
              <td class="text-start">
                <v-list-item>
                  <v-checkbox v-model="item.selected"></v-checkbox>
                </v-list-item>
              </td>
              <td
                class="text-start"
                @click="open(item)"
                style="cursor: pointer"
              >
                {{ item.name }}
              </td>
              <td class="text-start">
                {{ item.size | prettyBytes }}
              </td>
              <td class="text-start">
                {{ item.modified | formatDate }}
              </td>
              <td class="text-start">
                {{ item.perms }}
              </td>
              <td class="text-start">
                {{ item.owner }}
                {{ item.group }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import NewFile from "../../components/Files/NewFile";
import NewFolder from "../../components/Files/NewFolder";
import Chmod from "../../components/Files/Chmod";
import Chown from "../../components/Files/Chown";
import Rename from "../../components/Files/Rename";
import EditFile from "../../components/Files/EditFile";
import DeleteFiles from "../../components/Files/DeleteFiles";
import Download from "../../components/Files/Download";
import Clipboard from "../../components/Files/Clipboard";
import Upload from "../../components/Files/Upload";
import Extract from "../../components/Files/Extract";

export default {
  components: {
    Loading,
    NewFile,
    NewFolder,
    Chmod,
    Chown,
    Rename,
    EditFile,
    DeleteFiles,
    Download,
    Clipboard,
    Upload,
    Extract,
  },
  data() {
    return {
      path: "/",
      error: "",
      items: [],
      server: {},
      data: {},
      loading: false,
      fetching: false,
      dragover: false,
      serverId: 0,
      selected: [],

      headers: [
        {
          text: "",
          value: "",
        },
        {
          text: "Name ",
          value: "name",
        },
        {
          text: "Size ",
          value: "size",
        },
        {
          text: "Last modified ",
          value: "modified",
        },
        {
          text: "Permissions ",
          value: "perms",
        },
        {
          text: "Owner ",
          value: "owner",
        },
      ],
    };
  },
  watch: {
    items: {
      handler: function (newItems) {
        this.selected = [];

        for (var i = 0; i < newItems.length; i++) {
          if (newItems[i].selected) {
            this.selected.push(newItems[i]);
          }
        }
      },
      deep: true,
    },
    path: {
      handler: function (newValue) {
        window.ssh_path = newValue;
      },
    },
  },
  created() {
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  mounted() {
    var self = this;

    var counter = 0;
    this.$refs.results.$el.addEventListener("dragenter", (e) => {
      [2];
      e.preventDefault();
      counter++;
      self.dragover = true;
    });
    this.$refs.results.$el.addEventListener("dragleave", (e) => {
      [2];
      e.preventDefault();
      counter--;
      if (counter === 0) {
        self.dragover = false;
      }
    });
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/files", { path: this.path })
        .then(function (response) {
          console.log(response);

          self.server = response.data.item;

          self.items = [];
          response.data.files.forEach((element) => {
            self.items.push({
              id: element.id,
              name: element.name,
              size: element.size,
              type: element.type,
              modified: element.modified,
              perms: element.perms,
              permsn: element.permsn,
              owner: element.owner,
              group: element.group,
              selected: false,
            });
          });

          document.title = "Files | " + self.server.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    open(item) {
      if (item.type === "folder" || item.type === "link") {
        this.path = item.id;
        this.fetchData();
      } else if (item.type === "file") {
        // load file
        this.$refs.editFile.open(item);
      }
    },
    upLevel() {
      console.log(this.path);
      var index = this.path.lastIndexOf("/");
      if (index !== -1) {
        this.path = this.path.substr(0, index);

        if (!this.path) {
          this.path = "/";
        }
      }

      this.fetchData();
    },
    handleError(error) {
      this.error = error;
    },
    handleLoading(loading) {
      this.fetching = loading;
    },
    handleProgress(progress) {
      console.log(progress);
      this.dragover = false;
      this.fetching = true;
    },
  },
};
</script>