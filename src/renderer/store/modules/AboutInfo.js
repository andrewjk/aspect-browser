
const state = {
  showAboutInfo: false
}

const mutations = {
  openAboutInfo (state, data) {
    state.showAboutInfo = true
  },
  closeAboutInfo (state, data) {
    state.showAboutInfo = false
  }
}

export default {
  state,
  mutations
}
