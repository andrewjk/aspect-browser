/*

// https://stackoverflow.com/questions/43934593/atom-electron-webview-contextmenu-get-click-target#43974804

console.log('HEY')

document.addEventListener('click', callback, false)

function callback (e) {
  console.log(e)
  if (e.target.tagName !== 'A') {
  }

  // Do something
}

const elements = document.getElementsByTagName('a')
for (let i = 0; i < elements.length; i++) {
  elements[i].onclick = function () {
    // stuff
    console.log(elements[i])
  }
}
*/
