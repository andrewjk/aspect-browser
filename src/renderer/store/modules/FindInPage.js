
const state = {
  showFindInPage: false,
  focusFindInPage: false
}

const mutations = {
  openFindInPage (state, data) {
    state.showFindInPage = true
    state.focusFindInPage = true
  },
  closeFindInPage (state, data) {
    state.showFindInPage = false
  },
  unfocusFindInPage (state, data) {
    state.focusFindInPage = false
  }
}

export default {
  state,
  mutations
}
