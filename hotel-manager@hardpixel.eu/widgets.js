const GLib      = imports.gi.GLib
const GObject   = imports.gi.GObject
const St        = imports.gi.St
const PopupMenu = imports.ui.popupMenu

var HotelServerItem = new GObject.Class({
  Name: 'HotelServerItem',

  _init(menu, server) {
    this.menu   = menu
    this.server = server

    this._switchButton()
    this._restartButton()
    this._launchButton()
  },

  get label() {
    return this.server.name
  },

  get state() {
    return this.server.running
  },

  _addButton(button_name, icon_name) {
    const options = {
      x_align:         1,
      reactive:        true,
      can_focus:       true,
      track_hover:     true,
      accessible_name: button_name,
      style_class:     'system-menu-action hotel-manager-button'
    }

    const button = new St.Button(options)
    button.child = new St.Icon({ icon_name })

    this.widget.add(button, {
      expand:  false,
      x_align: St.Align.END
    })

    return button
  },

  _switchButton() {
    this.widget = new PopupMenu.PopupSwitchMenuItem(this.label, this.state)

    this.widget.connect('toggled', () => {
      this.server.toggle()
      this.widget.setToggleState(this.state)
    })
  },

  _restartButton() {
    const button = this._addButton('restart', 'view-refresh-symbolic')

    button.connect('clicked', () => {
      this.widget.setSensitive(false)

      if (this.state) {
        this.server.stop()
        this.widget.setToggleState(false)

        GLib.timeout_add(0, 500, () => {
          this.server.start()
          return false
        })

        GLib.timeout_add(0, 1000, () => {
          this.widget.setToggleState(this.state)
          this.widget.setSensitive(true)

          return false
        })
      } else {
        this.server.start()
        this.menu.close()
      }
    })
  },

  _launchButton() {
    const button = this._addButton('launch', 'network-workgroup-symbolic')

    button.connect('clicked', () => {
      this.server.open()
      this.menu.close()
    })
  }
})
