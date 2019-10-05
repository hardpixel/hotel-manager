const GObject         = imports.gi.GObject
const St              = imports.gi.St
const Main            = imports.ui.main
const PanelMenu       = imports.ui.panelMenu
const PopupMenu       = imports.ui.popupMenu
const ExtensionUtils  = imports.misc.extensionUtils
const HotelLauncher   = ExtensionUtils.getCurrentExtension()
const HotelService    = HotelLauncher.imports.service.HotelService
const HotelServerItem = HotelLauncher.imports.widgets.HotelServerItem

var HotelManager = GObject.registerClass(
  class HotelManager extends PanelMenu.Button {
    _init() {
      const icon_name   = 'network-cellular-hspa-symbolic'
      const style_class = 'system-status-icon'

      this.service = new HotelService()
      super._init(0.0, null, false)

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
)

let hotelManager

function enable() {
  hotelManager = new HotelManager()
  Main.panel.addToStatusArea('hotelManager', hotelManager)
}

function disable() {
  hotelManager.destroy()
  hotelManager = null
}
