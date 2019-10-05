const Soup           = imports.gi.Soup
const Util           = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils
const HotelLauncher  = ExtensionUtils.getCurrentExtension()
const Helpers        = HotelLauncher.imports.helpers

class HotelConfig {
  constructor() {
    this.defaults = { port: 2000, host: '127.0.0.1', tld: 'localhost' }
    this.filePath = '~/.hotel/conf.json'
    this.fileData = this.defaults

    this.reload()
  }

  get host() {
    return this.fileData.host || this.defaults.host
  }

  get port() {
    return this.fileData.port || this.defaults.port
  }

  get tld() {
    return this.fileData.tld || this.defaults.tld
  }

  get uri() {
    return `http://${this.host}:${this.port}`
  }

  reload() {
    this.fileData = Helpers.fileGetContents(this.filePath, {}, true)
  }
}

class HotelSession {
  constructor(config) {
    this.config  = config
    this.session = new Soup.Session()
  }

  uriFor(path) {
    const pathStr = path && `_/${path}`
    return new Soup.URI(`${this.config.uri}/${pathStr}`)
  }

  request(type, path) {
    const uri = this.uriFor(path)
    const msg = Soup.Message.new_from_uri(type, uri)

    msg.request_headers.append('accept', 'application/json')
    this.session.send_message(msg)

    if (type == 'GET') {
      try {
        return JSON.parse(msg.response_body.data)
      } catch (e) {
        return null
      }
    }

    return msg
  }

  get(path) {
    return this.request('GET', path)
  }

  post(path) {
    return this.request('POST', path)
  }

  head(path) {
    return this.request('HEAD', path)
  }
}

var HotelService = class HotelService {
  constructor() {
    this.config  = new HotelConfig()
    this.session = new HotelSession(this.config)
  }

  get running() {
    const msg = this.session.head()
    return msg.status_code != Soup.Status.CANT_CONNECT
  }

  get servers() {
    const servers = this.session.get('servers') || {}
    return Object.keys(servers).map(id => ({ id, ...servers[id] }))
  }

  get command() {
    const command = Helpers.fileGetLine('~/.hotelrc', 0, 'hotel')
    return Helpers.getFilePath(command)
  }

  start() {
    Util.spawn([this.command, 'start'])
  }

  stop() {
    Util.spawn([this.command, 'stop'])
  }

  toggle(activate) {
    if (activate) {
      this.start()
    } else {
      this.stop()
    }
  }

  serverRunning(serverId) {
    const server = this.servers.find(({ id }) => id == serverId)
    return server && server.status == 'running'
  }

  startServer(id) {
    const msg = this.session.post(`servers/${id}/start`)
    return msg.status_code == Soup.Status.OK
  }

  stopServer(id) {
    const msg = this.session.post(`servers/${id}/stop`)
    return msg.status_code == Soup.Status.OK
  }

  toggleServer(id, activate) {
    if (activate) {
      return this.startServer(id)
    } else {
      return this.stopServer(id)
    }
  }

  openServerUrl(id) {
    Util.spawn(['xdg-open', `http://${id}.${this.config.tld}`])
  }
}
