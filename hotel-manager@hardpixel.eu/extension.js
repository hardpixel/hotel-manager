const GLib            = imports.gi.GLib
const GObject         = imports.gi.GObject
const St              = imports.gi.St
const Main            = imports.ui.main
const PanelMenu       = imports.ui.panelMenu
const PopupMenu       = imports.ui.popupMenu
const ExtensionUtils  = imports.misc.extensionUtils
const HotelLauncher   = ExtensionUtils.getCurrentExtension()
const HotelService    = HotelLauncher.imports.service.HotelService
const HotelServerItem = HotelLauncher.imports.widgets.HotelServerItem

var HotelManager = new GObject.Class({
  Name: 'HotelManager',
  Extends: PanelMenu.Button,

  _init() {
    const icon_name   = 'network-cellular-hspa-symbolic'
    const style_class = 'system-status-icon'

    this.service = new HotelService()
    this.parent(0.0, 'HotelManager')

    this.icon = new St.Icon({ icon_name, style_class })
    this.add_actor(this.icon)

    this.menu.connect('open-state-changed', () => {
      this._refresh()
    })

    this._refresh()
  },

  _addHotelItem() {
    const hotelItem = new HotelServerItem('Hotel', this.service.running)
    this.menu.addMenuItem(hotelItem.widget)

    hotelItem.widget.connect('toggled', (button, state) => {
      this.service.toggle(state)
      this._setHotelItemState(button)
    })

    hotelItem.launchButton.connect('clicked', () => {
      this.service.openServerUrl('hotel')
      this.menu.close()
    })
  },

  _addServerItem({ id }, index) {
    const active     = this.service.serverRunning(id)
    const serverItem = new HotelServerItem(id, active)

    this.menu.addMenuItem(serverItem.widget)

    serverItem.widget.connect('toggled', (button, state) => {
      this.service.toggleServer(id, state)
      this._setServerItemState(button, id)
    })

    serverItem.launchButton.connect('clicked', (event) => {
      this.service.openServerUrl(id)
      this.menu.close()
    })
  },

  _addServerItems() {
    const servers = this.service.servers
    if (!servers.length) return

    const separator = new PopupMenu.PopupSeparatorMenuItem()
    this.menu.addMenuItem(separator)

    servers.forEach((server, index) => {
      GLib.idle_add(0, () => { this._addServerItem(server, index) })
    })
  },

  _setServerItemState(serverItem, id) {
    serverItem.setSensitive(false)

    const active = this.service.serverRunning(id)
    serverItem.setToggleState(active)

    serverItem.setSensitive(true)
  },

  _setHotelItemState(hotelItem) {
    hotelItem.setToggleState(this.service.running)
    hotelItem.setSensitive(true)
  },

  _refresh() {
    this.menu.removeAll()

    this._addHotelItem()
    this._addServerItems()
  }
})

let hotelManager

function enable() {
  hotelManager = new HotelManager()
  Main.panel.addToStatusArea('hotelManager', hotelManager)
}

function disable() {
  hotelManager.destroy()
  hotelManager = null
}
