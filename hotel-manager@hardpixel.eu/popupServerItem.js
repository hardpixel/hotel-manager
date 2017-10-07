const Lang      = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St        = imports.gi.St;
const Clutter   = imports.gi.Clutter;

var PopupServerItem = new Lang.Class({
  Name: 'PopupServerItem',
  Extends: PopupMenu.PopupSwitchMenuItem,
  _params: {},

  _init: function(text, active, params) {
    this._params = params;
    this.parent(text, active);

    this._restartButton();
    this._launchButton();
  },

  _icon: function(icon_name) {
    let icon = new St.Icon({ icon_name: icon_name });
    return icon;
  },

  _button: function(button_name, icon_name) {
    let options = {
      x_align:         1,
      reactive:        true,
      can_focus:       true,
      track_hover:     true,
      accessible_name: button_name,
      style_class:     'system-menu-action hotel-manager-button'
    };

    let button   = new St.Button(options);
    button.child = this._icon(icon_name);

    return button;
  },

  _restartButton: function() {
    if (this._params.restartButton) {
      this.restartButton = this._button('restart', 'view-refresh-symbolic');
      this.actor.add(this.restartButton, { expand: false, x_align: St.Align.END });

      this.restartButton.connect('clicked', Lang.bind(this, function() {
        this.setToggleState(false);
        this.emit('toggled', false);
        this.emit('toggled', true);
      }));
    }
  },

  _launchButton: function() {
    if (this._params.launchButton) {
      this.launchButton = this._button('launch', 'network-workgroup-symbolic');
      this.actor.add(this.launchButton, { expand: false, x_align: St.Align.END });
    }
  },

  activate: function(event) {
    if (this._params.autoCloseMenu) {
      this.parent(event);
    } else if (this._switch.actor.mapped) {
      this.toggle();
    }
  }
});
