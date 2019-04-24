import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default new Datastore({
  autoload: false,
  isLoaded: false,
  filename: path.join(remote.app.getPath('userData'), 'Data/logins.db')
})
