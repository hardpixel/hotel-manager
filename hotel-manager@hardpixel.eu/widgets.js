const GLib      = imports.gi.GLib
const GObject   = imports.gi.GObject
const St        = imports.gi.St
const PopupMenu = imports.ui.popupMenu

var HotelServerItem = GObject.registerClass({
  Signals: { close: {} }
}, class HotelServerItem extends PopupMenu.PopupSwitchMenuItem {
    _init(server) {
      this.server = server
      super._init(server.name, server.running, { style_class: 'hotel-manager-item' })

      this._addButton('restart', {
        icon_name: 'view-refresh-symbolic',
        callback:  this._onRestart
      })

      this._addButton('launch', {
        icon_name: 'network-workgroup-symbolic',
        callback:  this._onLaunch
      })
    }

    toggle() {
      this.server.toggle()
      this.syncToggleState()
    }

    syncToggleState() {
      this.setToggleState(this.server.running)
    }

    _addButton(button_name, { icon_name, callback }) {
      const button = new St.Button({
        x_align:         1,
        reactive:        true,
        can_focus:       true,
        track_hover:     true,
        accessible_name: button_name,
        style_class:     'system-menu-action hotel-manager-button'
      })

      button.child = new St.Icon({ icon_name, style_class: 'popup-menu-icon' })

      button.connect('clicked', () => {
        callback.call(this)
        this.emit('close')
      })

      this.add(button, { expand: false, x_align: St.Align.END })
    }

    _onRestart() {
      this.server.stop()

      GLib.timeout_add(0, 1000, () => {
        this.server.start()
        return false
      })
    }

    _onLaunch() {
      this.server.open()
    }
  }
)
