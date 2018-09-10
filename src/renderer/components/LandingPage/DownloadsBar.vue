<template>
  <div class="downloads-bar-wrapper">
    <div class="downloads-bar">
      <button v-for="(item) in downloads" :key="item.filename" class="download" :title="downloadTitle(item)" @click="downloadClicked(item)">
        <template v-if="item.isDownloading">
          <fa icon="spinner" class="download-icon" spin/>
        </template>
        <template v-else-if="item.icon">
          <img class="download-icon" :src="item.icon">
        </template>
        <span class="download-title">{{ item.filename }}</span>
        <button v-if="!item.isCompleted" class="download-button" @click="cancelDownload(item)" title="Cancel download">
          <fa icon="times"/>
        </button>
        <button v-if="item.isCompleted && !item.isCancelled" class="download-button" @click="openFolder(item)" title="Show file in folder">
          <fa icon="folder-open"/>
        </button>
        <div v-if="item.isCompleted && item.isCancelled" class="download-button" title="Cancelled">
          <fa icon="times"/>
        </div>
        <div v-if="!item.isCompleted" class="download-progress-wrapper">
          <div class="download-progress-bar" :style="progressStyle(item)" :title="item.progress"></div>
        </div>
      </button>
      <div class="downloads-bar-spacer">
      </div>
      <button class="downloads-bar-button" title="Show all downloads in the downloads page" @click="showDownloads({ persona })">
        View downloads
      </button>
      <button class="downloads-bar-button" title="Close the downloads bar" @click="closeDownloadsBar">
        <fa icon="times"/>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { shell, ipcRenderer } from 'electron'
  import filesize from 'filesize'

  export default {
    props: {
      persona: null
    },
    data () {
      return {
        downloads: this.persona.downloads
      }
    },
    methods: {
      ...mapMutations([
        'closeDownloadsBar',
        'showDownloads'
      ]),
      progressStyle (item) {
        return { width: (item.progress / item.size * 100) + '%' }
      },
      downloadTitle (item) {
        if (item.isCompleted) {
          return `Completed: ${item.filename} (${filesize(item.size)}). Click to open the file`
        } else {
          if (item.isPaused) {
            return `Paused: ${+(item.progress / item.size * 100).toFixed(2)}% of ${filesize(item.size)}. Click to resume the download`
          } else {
            return `Downloading: ${+(item.progress / item.size * 100).toFixed(2)}% of ${filesize(item.size)}. Click to pause the download`
          }
        }
      },
      downloadClicked (item) {
        if (item.isCompleted) {
          this.openDownload(item)
        } else {
          if (item.isPaused) {
            this.resumeDownload(item)
          } else {
            this.pauseDownload(item)
          }
        }
      },
      pauseDownload (item) {
        ipcRenderer.send('pause-download', { localFile: item.localFile })
      },
      resumeDownload (item) {
        ipcRenderer.send('resume-download', { localFile: item.localFile })
      },
      cancelDownload (item) {
        ipcRenderer.send('cancel-download', { localFile: item.localFile })
      },
      openDownload (item) {
        shell.openItem(item.localFile)
      },
      openFolder (item) {
        shell.showItemInFolder(item.localFile)
      }
    }
  }
</script>

<style scoped>

  .downloads-bar-wrapper {
    background-color: #eee;
    border-top: 1px solid #ddd;
    font-size: 14px;
    padding: 5px;
    user-select: none;
    cursor: default;
  }

  .downloads-bar {
    display: flex;
    line-height: 24px;
  }

  .download {
    background-color: #ccc;
    border-radius: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 64px;
    max-width: 200px;
    padding: 5px;
    margin-right: 5px;
    line-height: 18px;
    vertical-align: top;
    text-align: left;
    cursor: pointer;
  }

  .download:hover,
  .download:focus {
    background-color: #ddd;
  }

  .download-icon {
    height: 16px;
    width: 16px;
    margin: 1px 5px 1px 0;
  }

  .download-title {
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;
    flex: 1;
    margin-right: 5px;
  }

  .download-button {
    border-radius: 2px;
    vertical-align: top;
    padding: 2px 4px;
  }

  .download-button:hover,
  .download-button:focus {
    background-color: #ccc;
  }

  .download-progress-wrapper {
    width: 100%;
    margin-top: 2px;
  }

  .download-progress-bar {
    background-color: #25b36d;
    height: 2px;
  }

  .downloads-bar-spacer {
    flex-grow: 1;
  }

  .downloads-bar-button {
    border-radius: 2px;
    vertical-align: top;
    padding: 2px 4px;
    max-height: 22px;
    align-self: center;
    margin-left: 5px;
    cursor: pointer;
  }

  .downloads-bar-button:hover,
  .downloads-bar-button:focus {
    background-color: #ddd;
  }

</style>
