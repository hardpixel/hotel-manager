import { GLib, GObject, St } from '#gi'
import { popupMenu as PopupMenu } from '#ui'

export class HotelServerItem extends PopupMenu.PopupSwitchMenuItem {
  static {
    GObject.registerClass({ Signals: { close: {} } }, this)
  }

  constructor(server) {
    super(server.name, server.running, {
      style_class: 'hotel-manager-item'
    })

    this.server = server

    this._addButton('restart', {
      icon_name: 'view-refresh-symbolic',
      callback:  this._onRestart
    })

    this._addButton('launch', {
      icon_name: 'web-browser-symbolic',
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

    this.add_child(button)
  }

  _onRestart() {
    this.server.stop()

    GLib.timeout_add(0, 1000, () => {
      this.server.start()
      return GLib.SOURCE_REMOVE
    })
  }

  _onLaunch() {
    this.server.open()
  }
}
