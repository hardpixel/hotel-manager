const Soup    = imports.gi.Soup
const Util    = imports.misc.util
const Me      = imports.misc.extensionUtils.getCurrentExtension()
const Helpers = Me.imports.helpers

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
      return Helpers.toJSON(msg.response_body.data)
    } else {
      return msg
    }
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

class HotelServer {
  constructor(name, data, { config, session }) {
    this.name    = name
    this.data    = Object(data)
    this.config  = config
    this.session = session
  }

  get running() {
    return this.data.status == 'running'
  }

  start() {
    this.session.post(`servers/${this.name}/start`)
  }

  stop() {
    this.session.post(`servers/${this.name}/stop`)
  }

  toggle() {
    if (this.running) {
      this.stop()
    } else {
      this.start()
    }
  }

  open() {
    Util.spawn(['xdg-open', `http://${this.name}.${this.config.tld}`])
  }
}

var HotelService = class HotelService {
  constructor() {
    this.name    = 'Hotel'
    this.config  = new HotelConfig()
    this.session = new HotelSession(this.config)
  }

  get running() {
    const msg = this.session.head()
    return msg.status_code != Soup.Status.CANT_CONNECT
  }

  get servers() {
    const servers = this.session.get('servers') || {}

    return Object.keys(servers).map(name => {
      return new HotelServer(name, servers[name], this)
    })
  }

  get command() {
    return Helpers.findProgramPath()
  }

  start() {
    Util.spawn([this.command, 'start'])
  }

  stop() {
    Util.spawn([this.command, 'stop'])
  }

  toggle() {
    if (this.running) {
      this.stop()
    } else {
      this.start()
    }
  }

  open() {
    Util.spawn(['xdg-open', `http://hotel.${this.config.tld}`])
  }
}
