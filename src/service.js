import { Soup } from '#gi'
import { util as Util } from '#misc'
import { fileGetContents, toJSON, findProgramPath } from '#me/helpers'

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
    this.fileData = fileGetContents(this.filePath, {}, true)
  }
}

class HotelSession {
  constructor(config) {
    this.config  = config
    this.session = new Soup.Session()
  }

  request(type, path) {
    const uri = path ? `${this.config.uri}/_/${path}` : this.config.uri
    const msg = Soup.Message.new(type, uri)

    msg.request_headers.append('accept', 'application/json')

    let result = null

    if (this.session.send_message) {
      this.session.send_message(msg)
      result = msg.response_body.data
    } else {
      const bytes   = this.session.send_and_read(msg, null)
      const decoder = new TextDecoder('utf-8')

      result = decoder.decode(bytes.get_data())
    }

    if (type == 'GET') {
      return toJSON(result)
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

export class HotelService {
  constructor() {
    this.name    = 'Hotel'
    this.config  = new HotelConfig()
    this.session = new HotelSession(this.config)
  }

  get running() {
    try {
      const msg = this.session.head()
      return msg.status_code != Soup.Status.CANT_CONNECT
    } catch (e) {
      return false
    }
  }

  get servers() {
    try {
      const servers = this.session.get('servers') || {}

      return Object.keys(servers).map(name => {
        return new HotelServer(name, servers[name], this)
      })
    } catch (e) {
      return []
    }
  }

  get command() {
    return findProgramPath()
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
