<div align="center">

# Aspect

A multi-persona web browser  
≈ still very much a work in progress ≈

<p>&nbsp;</p>

</div>

![A screenshot of the main browser screen, showing the list of personas, a home page and some open tabs](/docs/images/screenshot.png)

## About

Aspect allows you to setup multiple personas, each containing their own bookmarks, logins, history and tabs.

You might want to set up a persona for your personal browsing and one for your work browsing, to avoid having to log in and out of email and social media accounts. You might want to set up a persona for each client if you manage the same accounts for multiple customers. You might want to set up a persona for Facebook or Google to keep them from knowing too much about your browsing habits.

Aspect is built on the Electron platform for Windows, Mac and Linux.

## Features

* Setup multiple personas with their own bookmarks, logins, history and tabs
* Add bookmarks to the home page of each persona for quick access
* Tabbed browsing makes it easy to keep your browsing confined to the one persona
* Use keyboard shortcuts to switch between personas and tabs
* Use Quick Find to search for personas and bookmarks
* Manage history for each persona
* Manage downloads for each persona
* Manage login details for each persona
  * Can be turned on in Settings => Login Manager
  * Requires a master password to be set
  * Has not been audited - use at your own risk!
* Restore, save and load sessions
* Automatically suspends background tabs after 30 minutes to lower memory usage
* Personalize your home pages with background images and widgets including clock, weather, news and to-do

## Download

![Windows logo](/docs/images/windows.png) [Windows](https://github.com/andrewjk/aspect-browser/releases/download/v0.0.10/aspect-browser-setup-0.0.10.exe)

![Apple logo](/docs/images/apple.png) [Mac](https://github.com/andrewjk/aspect-browser/releases/download/v0.0.10/Aspect-0.0.10.dmg)

![Linux logo](/docs/images/linux.png) [Linux](https://github.com/andrewjk/aspect-browser/releases/download/v0.0.10/aspect-browser-0.0.10-x86_64.AppImage)

![All platforms logo](/docs/images/all-platforms.png) [All platforms](https://github.com/andrewjk/aspect-browser/releases/tag/v0.0.10)

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| Ctrl/Command + ` | Next Persona |
| Ctrl/Command + Shift + ` | Previous Persona |
| Alt/Option + 1-9 | Select a Persona |
| Ctrl/Command + Tab | Next Tab |
| Ctrl/Command + Shift + Tab | Previous Tab |
| Ctrl/Command + 1-9 | Select a Tab |
| Ctrl/Command + . | Quick Find |
| Ctrl/Command + T | Open a New Tab |
| Ctrl/Command + W | Close the Current Tab |
| Ctrl/Command + Shift + T | Re-open a Closed Tab |
| Ctrl/Command + L | Focus the Address Box |
| Ctrl/Command + F | Find in Page |
| Ctrl/Command + H | Show History |
| Ctrl/Command + D | Show Downloads |
| Ctrl/Command + Plus/Minus | Zoom In/Zoom Out |
| Ctrl/Command + 0 | Reset Zoom |

## Build

``` bash
# clone into aspect-browser
git clone https://github.com/andrewjk/aspect-browser.git
cd aspect-browser

# install dependencies
npm install  

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

```

## License

This project is licensed under the [MIT License](LICENSE.md).

## Built With

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli).

Icons are from [Font Awesome](https://fontawesome.com/) via [vue-fontawesome](https://github.com/FortAwesome/vue-fontawesome).

Storage is implemented with [NeDB](https://github.com/louischatriot/nedb/).
