const Lang      = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St        = imports.gi.St;

var PopupServerItem = new Lang.Class({
  Name: 'PopupServerItem',

  _init: function(text, active, params) {
    this.params = params || {};
    this.widget = new PopupMenu.PopupSwitchMenuItem(text, active);

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
    if (!this.params.restartButton) return;

    this.restartButton = this._button('restart', 'view-refresh-symbolic');
    this.widget.actor.add(this.restartButton, { expand: false, x_align: St.Align.END });

    this.restartButton.connect('clicked', Lang.bind(this, function() {
      this.widget.setToggleState(false);
      this.widget.emit('toggled', false);
      this.widget.emit('toggled', true);
    }));
  },

  _launchButton: function() {
    if (!this.params.launchButton) return;

    this.launchButton = this._button('launch', 'network-workgroup-symbolic');
    this.widget.actor.add(this.launchButton, { expand: false, x_align: St.Align.END });
  }
});
