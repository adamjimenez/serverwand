<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <EditFile ref="editFile" :serverId="serverId" action="files" @complete="fetchData()" @error="handleError"
      @loading="handleLoading" />

    <v-card :loading="fetching">
      <v-container fluid>
        <v-row>
          <NewFile v-if="selected.length === 0" :serverId="serverId" :path="path" @complete="fetchData()"
            @error="handleError" />
          <NewFolder v-if="selected.length === 0" :serverId="serverId" :path="path" @complete="fetchData()"
            @error="handleError" />
          <Upload v-if="selected.length === 0" :serverId="serverId" :path="path" :dropZone="$refs.results"
            @complete="fetchData()" @error="handleError" folder="folder" />
          <Rename v-if="selected.length === 1" :serverId="serverId" :path="path" :selected="selected"
            @complete="fetchData()" @error="handleError" />
          <DeleteFiles v-if="selected.length" :serverId="serverId" :path="path" :selected="selected"
            @complete="fetchData()" @error="handleError" />
          <Chmod :serverId="serverId" :path="path" :selected="selected" :folderSelected="folderSelected"
            @complete="fetchData()" @error="handleError" />
          <Chown :serverId="serverId" :path="path" :selected="selected" :folderSelected="folderSelected"
            @complete="fetchData()" @error="handleError" />
          <Extract :serverId="serverId" :path="path" :selected="selected" @complete="fetchData()" @error="handleError"
            @loading="handleLoading" />
          <Download v-if="selected.length === 1 && selected[0].type === 'file'" :serverId="serverId" :path="path"
            :selected="selected" />
          <Clipboard :serverId="serverId" :path="path" :selected="selected" @complete="fetchData()"
            @error="handleError" />
        </v-row>
      </v-container>

      <v-container fluid>
        <v-row>
          <v-btn icon @click="upLevel()" :disabled="path === '/'" title="Up one level">
            <v-icon size="small">mdi:mdi-arrow-up</v-icon>
          </v-btn>
          <v-text-field v-model="path" class="mx-2" @change="fetchData" @keydown.enter="fetchData"></v-text-field>
          <!--
            <v-text-field placeholder="Search" prepend-inner-icon="mdi:mdi-magnify" v-model="search" class="ma-0 pa-0"
              @change="fetchData" @keydown.enter="fetchData"></v-text-field>
            -->
        </v-row>
      </v-container>

      <v-data-table v-model="selectedIds" :headers="headers" :items="items" class="results" ref="results" show-select
        mobile-breakpoint="0" @click:row="function (event, item) { open(item.item) }" :loading="fetching" :page="page">

        <template v-slot:item.size="{ item }">
          {{ prettyBytes(item.size) }}
        </template>

        <template v-slot:item.modified="{ item }">
          {{ formatDate(item.modified) }}
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
import util from "../../services/util";
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
      selectedIds: [],
      folderSelected: false,
      headers: [{
        title: "",
        key: "",
      }, {
        title: "Name ",
        key: "name",
      }, {
        title: "Size ",
        key: "size",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "Last modified ",
        key: "modified",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "Permissions ",
        key: "perms",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }, {
        title: "Owner ",
        key: "owner",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }],
      fileToOpen: '',
      page: 1,
    };
  },
  computed: {
    dir: function () {
      let path = this.path;

      if (!path.endsWith('/')) {
        let pos = path.lastIndexOf('/');
        if (pos !== -1) {
          path = path.substr(0, pos);
        }
      }

      return path;
    },
    selected: function () {
      let selected = [];

      this.selectedIds.forEach((id) => {
        let item = this.items.find(obj => obj.id === id);
        if (item) {
          selected.push(item)
        }
      });

      return selected;
    }
  },
  watch: {
    path: {
      handler: function (newValue) {
        window.ssh_path = newValue;

        this.selectedIds = [];
        // change location hash without triggering a reload
        this.userHashChange = false;
        location.hash = newValue;
      },
    },
    selected: function (newVal) {
      let folderSelected = false;
      newVal.forEach(element => {
        if (element.type === 'folder') {
          folderSelected = true;
        }
      });
      this.folderSelected = folderSelected;
    },
  },
  created() {
    this.serverId = this.$route.params.id;

    // change folder when url hash is manually edited
    window.onhashchange = () => {
      if (this.userHashChange) {
        this.path = location.hash.substr(1);
        this.fetchData();
      } else {
        this.userHashChange = true
      }
    };

    // load initial location hash
    if (location.hash) {
      this.path = location.hash.substr(1);

      var file = this.basename(this.path);

      if (file.indexOf('.') !== -1) {
        this.fileToOpen = file;
      }
    }

    this.fetchData();
  },
  methods: {
    basename(path) {
      return path.split(/[\\/]/).pop();
    },
    fetchData() {
      this.error = "";
      this.fetching = true;
      this.page = 1;

      if (this.search) {
        this.items = [];

        api.event('servers/' + this.serverId + '/files?path=' + encodeURIComponent(this.dir) + '&search=' + encodeURIComponent(this.search),
          result => {
            let files = result.msg.split("\n");

            files.forEach(file => {
              // check if item already exists
              let found = false;
              this.items.forEach(item => {
                if (item.id === file)
                  found = true;
              });

              if (!found) {
                this.items.push({
                  id: file,
                  name: this.basename(file),
                  type: 'file',
                });
              }
            });
          },
          error => this.error = error,
          () => this.fetching = false
        );

      } else {

        api
          .post("servers/" + this.serverId + "/files", {
            path: this.dir
          })
          .then(response => {
            console.log(response);

            if (response.data.error) {
              this.error = response.data.error;
              return;
            }

            this.server = response.data.item;

            this.items = [];
            response.data.files.forEach(element => {
              this.items.push({
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

            document.title = "Files | " + this.server.name;
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            this.fetching = false;
            this.selectedIds = [];

            // open file if we have one
            if (this.fileToOpen) {
              let file = this.fileToOpen;
              let line = 1;
              if (file.indexOf(':') !== -1) {
                let arr = file.split(':');
                file = arr[0];
                line = arr[1];
              }

              this.items.forEach(async item => {
                if (item.name === file) {
                  this.fileToOpen = '';
                  await this.$refs.editFile.open(item);
                  this.$refs.editFile.goToLine(line);
                }
              });
            }
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
      this.search = '';
      let index = this.path.substr(0, this.path.length - 1).lastIndexOf("/");
      if (index !== -1) {
        this.path = this.path.substr(0, index + 1);

        if (!this.dir) {
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
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
    formatDate(value) {
      return util.formatDate(value);
    }
  },
};
</script>