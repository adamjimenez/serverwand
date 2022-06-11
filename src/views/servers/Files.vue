<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
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
      @loading="handleLoading"
    />

    <v-card :loading="fetching">
      <v-container fluid>
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
            :dropZone="$refs.results"
            @complete="fetchData()"
            @error="handleError"
            folder="folder"
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

      <v-container fluid>
        <v-row>
          <v-col class="flex-grow-0">
            <v-btn icon @click="upLevel()" :disabled="path === '/'" title="Up one level">
              <v-icon small>arrow_upward</v-icon>
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

          <v-col cols="2">
            <v-text-field
              placeholder="Search"
              prepend-inner-icon="search"
              v-model="search"
              class="ma-0 pa-0"
              @change="fetchData"
              @keydown.enter="fetchData"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        class="results"
        ref="results"
        show-select
        mobile-breakpoint="0"
        @click:row="open"
      >

        <template v-slot:item.size="{ item }">
          {{ item.size | prettyBytes }}
        </template>

        <template v-slot:item.modified="{ item }">
          {{ item.modified | formatDate }}
        </template>

        <template v-slot:item.owner="{ item }">
          {{ item.owner }}
          {{ item.group }}
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
      search: "",
      error: "",
      items: [],
      server: {},
      data: {},
      loading: false,
      fetching: false,
      userHashChange: true,
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
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "Last modified ",
          value: "modified",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "Permissions ",
          value: "perms",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
        {
          text: "Owner ",
          value: "owner",
          class: 'd-none d-sm-table-cell',
          cellClass: 'd-none d-sm-table-cell',
        },
      ],
    };
  },
  watch: {
    path: {
      handler: function (newValue) {
        window.ssh_path = newValue;

        // change location hash without triggering a reload
        this.userHashChange = false;
        location.hash = newValue;
      },
    },
  },
  created() {
    this.serverId = this.$route.params.id;

    var self = this;

    // change folder when url hash is manually edited
    function locationHashChanged () {
      if (self.userHashChange) {
        self.path = location.hash.substr(1);
        self.fetchData();
      } else {
        self.userHashChange = true
      }
    };

    window.onhashchange = locationHashChanged;

    // load initial location hash
    if(location.hash) {
      this.path = location.hash.substr(1);
    }
    
    this.fetchData();
  },
  methods: {
    basename(path) {
      return path.split(/[\\/]/).pop();
    },
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      if (this.search) {
        this.items = [];

        api.event(
          'servers/' + this.serverId + '/files?path=' + encodeURIComponent(this.path) + '&search=' + encodeURIComponent(this.search),
          result => {
            let files = result.msg.split("\n");

            files.forEach(function (file) {
              // check if item already exists
              let found = false;
              self.items.forEach(function (item) {
                if (item.id === file) {
                  found = true;
                }
              });

              if (!found) {
                self.items.push({
                  id: file,
                  name: self.basename(file),
                  type: 'file',
                });
              }
            });
          },
          error => self.error = error,
          () => self.fetching = false
        );

      } else {

        api
          .post("servers/" + this.serverId + "/files", { 
            path: this.path
          })
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
            self.selected = [];
          });

      }
    },
    open(item) {
      this.error = '';
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
      this.search = '';
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
  },
};
</script>