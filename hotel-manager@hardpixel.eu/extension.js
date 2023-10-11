import GObject from 'gi://GObject'
import St from 'gi://St'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'
import { HotelService } from './service.js'
import { HotelServerItem } from './widgets.js'

class HotelManager extends PanelMenu.Button {
  static {
    GObject.registerClass(this)
  }

  constructor() {
    super(0.2, null, false)

    this.service = new HotelService()

    const icon_name   = 'network-cellular-hspa-symbolic'
    const style_class = 'system-status-icon'

    this.icon = new St.Icon({ icon_name, style_class })
    this.add_actor(this.icon)

    this.menu.connect('open-state-changed', () => {
      this._refresh()
    })

    this._refresh()
  }

  _addHotelItem() {
    const item = new HotelServerItem(this.service)
    item.connect('close', () => this.menu.close())

    this.menu.addMenuItem(item)
  }

  _addServerItems() {
    const servers = this.service.servers
    if (!servers.length) return

    const separator = new PopupMenu.PopupSeparatorMenuItem()
    this.menu.addMenuItem(separator)

    servers.forEach((server) => {
      const item = new HotelServerItem(server)
      item.connect('close', () => this.menu.close())

      this.menu.addMenuItem(item)
    })
  }

  _refresh() {
    this.menu.removeAll()

    this._addHotelItem()
    this._addServerItems()
  }
}

export default class Extension {
  enable() {
    this.button = new HotelManager()
    Main.panel.addToStatusArea('hotelManager', this.button)
  }

  disable() {
    if (this.button) {
      this.button.destroy()
      this.button = null
    }
  }
}
