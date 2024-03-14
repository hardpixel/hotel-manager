import { GObject, St } from '#gi'

import { main as Main } from '#ui'
import { panelMenu as PanelMenu } from '#ui'
import { popupMenu as PopupMenu } from '#ui'

import { HotelService } from '#me/service'
import { HotelServerItem } from '#me/widgets'

class HotelManagerButton extends PanelMenu.Button {
  static {
    GObject.registerClass(this)
  }

  constructor() {
    super(0.2, null, false)

    this.service = new HotelService()

    const icon_name   = 'network-cellular-hspa-symbolic'
    const style_class = 'system-status-icon'

    this.icon = new St.Icon({ icon_name, style_class })
    this.add_child(this.icon)

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

export default class HotelManagerExtension {
  enable() {
    this.button = new HotelManagerButton()
    Main.panel.addToStatusArea('hotelManager', this.button)
  }

  disable() {
    this.button?.destroy()
    this.button = null
  }
}
