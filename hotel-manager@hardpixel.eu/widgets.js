const GObject   = imports.gi.GObject
const St        = imports.gi.St
const PopupMenu = imports.ui.popupMenu

var HotelServerItem = new GObject.Class({
  Name: 'HotelServerItem',

  _init(text, active) {
    this.widget = new PopupMenu.PopupSwitchMenuItem(text, active)

    this._restartButton()
    this._launchButton()
  },

  _button(button_name, icon_name) {
    const options = {
      x_align:         1,
      reactive:        true,
      can_focus:       true,
      track_hover:     true,
      accessible_name: button_name,
      style_class:     'system-menu-action hotel-manager-button'
    }

    const button = new St.Button(options)
    button.child = new St.Icon({ icon_name: icon_name })

    return button
  },

  _restartButton() {
    this.restartButton = this._button('restart', 'view-refresh-symbolic')
    this.widget.add(this.restartButton, { expand: false, x_align: St.Align.END })

    this.restartButton.connect('clicked', () => {
      this.widget.setToggleState(false)
      this.widget.emit('toggled', false)
      this.widget.emit('toggled', true)
    })
  },

  _launchButton() {
    this.launchButton = this._button('launch', 'network-workgroup-symbolic')
    this.widget.add(this.launchButton, { expand: false, x_align: St.Align.END })
  }
})
