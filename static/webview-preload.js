
// TODO: Listen to context menus so that we can show our own:
// https://stackoverflow.com/questions/43934593/atom-electron-webview-contextmenu-get-click-target#43974804

const { ipcRenderer } = require('electron')

// HACK: We need to do some bad things to get the personaId of the webview we are in
// See the comments in TabPage.vue for more info
ipcRenderer.on('here-is-persona-id', (event, data) => {
  // Set up login management for forms with password fields
  document.addEventListener('DOMContentLoaded', () => {
    // Get the personaId from the document
    const personaId = document.__personaId

    // Load forms with password fields
    const allForms = document.getElementsByTagName('form')
    const formsToHook = []
    for (let form of allForms) {
      if (form.querySelectorAll('input[type="password"]').length) {
        formsToHook.push(form)
      }
    }

    if (formsToHook.length) {
      // Store passwords against the host - which means there should only be one password per host per persona
      const host = document.location.host

      // Let the caller know that we've found each form and may need its details
      for (let form of formsToHook) {
        ipcRenderer.send('form-found-with-password-' + personaId, { form: form.action, host })
      }

      // Listen to the submit event for each form
      for (let form of formsToHook) {
        form.addEventListener('submit', () => {
          const fields = serialize(form)
          ipcRenderer.send('form-submitted-with-password-' + personaId, { form: form.action, host, fields })
        })
      }
    }

    // Accept login details
    ipcRenderer.on('form-password-fill-' + personaId, (event, data) => {
      // NOTE: Can't use querySelectorAll here because the form action may have incompatible characters
      for (let form of document.getElementsByTagName('form')) {
        if (form.action === data.form) {
          const fields = data.fields
          deserialize(form, fields)
        }
      }
    })
  })
})

ipcRenderer.send('give-persona-id-please')

// From https://stackoverflow.com/a/23140111
function serialize (form) {
  if (!form || form.nodeName !== 'FORM') {
    return
  }
  let fields = {}
  for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
    if (!form.elements[i].name) {
      continue
    }
    switch (form.elements[i].nodeName) {
      case 'INPUT':
        switch (form.elements[i].type) {
          case 'text':
          case 'email':
          case 'password':
            fields[form.elements[i].name] = encodeURIComponent(form.elements[i].value)
            break
          case 'checkbox':
          case 'radio':
            fields[form.elements[i].name] = form.elements[i].checked
            break
        }
        break
      case 'TEXTAREA':
        fields[form.elements[i].name] = encodeURIComponent(form.elements[i].value)
        break
      case 'SELECT':
        switch (form.elements[i].type) {
          case 'select-one':
            fields[form.elements[i].name] = encodeURIComponent(form.elements[i].value)
            break
          // case 'select-multiple':
          //   for (let j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
          //     if (form.elements[i].options[j].selected) {
          //       fields.push(form.elements[i].name + '=' + encodeURIComponent(form.elements[i].options[j].value))
          //     }
          //   }
          //   break
        }
        break
    }
  }
  return fields
}

// From https://stackoverflow.com/a/23140111
function deserialize (form, fields) {
  if (!form || form.nodeName !== 'FORM') {
    return
  }
  for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
    if (!form.elements[i].name) {
      continue
    }
    if (!fields[form.elements[i].name]) {
      continue
    }
    switch (form.elements[i].nodeName) {
      case 'INPUT':
        switch (form.elements[i].type) {
          case 'text':
          case 'email':
          case 'password':
            form.elements[i].value = decodeURIComponent(fields[form.elements[i].name])
            break
          case 'checkbox':
          case 'radio':
            form.elements[i].checked = fields[form.elements[i].name]
            break
        }
        break
      case 'TEXTAREA':
        form.elements[i].value = decodeURIComponent(fields[form.elements[i].name])
        break
      case 'SELECT':
        switch (form.elements[i].type) {
          case 'select-one':
            form.elements[i].value = decodeURIComponent(fields[form.elements[i].name])
            break
          // case 'select-multiple':
          //   for (let j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
          //     if (form.elements[i].options[j].selected) {
          //       data.push(form.elements[i].name + '=' + encodeURIComponent(form.elements[i].options[j].value))
          //     }
          //   }
          //   break
        }
        break
    }
  }
}
