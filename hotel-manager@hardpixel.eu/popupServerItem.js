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
            track_hover:     true,
            accessible_name: 'restart',
            style_class:     'system-menu-action services-systemd-button-reload'
          });

        this.restartButton.child = new St.Icon({ icon_name: 'view-refresh-symbolic' });
        this.actor.add(this.restartButton, { expand: false, x_align: St.Align.END });
    }
  }
});
