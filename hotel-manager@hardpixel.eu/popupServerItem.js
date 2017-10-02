const Lang      = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St        = imports.gi.St;

const PopupServerItem = new Lang.Class({
  Name: 'PopupServerItem',
  Extends: PopupMenu.PopupSwitchMenuItem,

  _init: function(text, active, params) {
    this.parent(text, active);

    if (params.restartButton) {
      this.restartButton = new St.Button(
        {
          x_align:         1,
          reactive:        true,
          can_focus:       true,
          track_hover:     false,
          accessible_name: 'restart',
          style_class:     'system-menu-action hotel-manager-button'
        });

      this.restartButton.child = new St.Icon({ icon_name: 'view-refresh-symbolic' });
      this.actor.add(this.restartButton, { expand: false, x_align: St.Align.END });
    }

    if (params.launchButton) {
      this.launchButton = new St.Button(
        {
          x_align:         1,
          reactive:        true,
          can_focus:       true,
          track_hover:     false,
          accessible_name: 'launch',
          style_class:     'system-menu-action hotel-manager-button'
        });

      this.launchButton.child = new St.Icon({ icon_name: 'network-workgroup-symbolic' });
      this.actor.add(this.launchButton, { expand: false, x_align: St.Align.END });
    }
  }
});
