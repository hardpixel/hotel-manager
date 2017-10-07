const GLib            = imports.gi.GLib;
const Lang            = imports.lang;
const Main            = imports.ui.main;
const Mainloop        = imports.mainloop;
const PanelMenu       = imports.ui.panelMenu;
const PopupMenu       = imports.ui.popupMenu;
const St              = imports.gi.St;
const ExtensionUtils  = imports.misc.extensionUtils;
const HotelLauncher   = ExtensionUtils.getCurrentExtension();
const PopupServerItem = HotelLauncher.imports.popupServerItem.PopupServerItem;
const Util            = imports.misc.util;

const HotelManager = new Lang.Class({
  Name: 'HotelManager',
  _entries: {},
  _running: false,
  _uri: 'http://localhost:2000',

  _init: function() {
    this._createContainer();
    this._refresh();
  },

  _createContainer: function() {
    this.container = new PanelMenu.Button()
    PanelMenu.Button.prototype._init.call(this.container, 0.0);

    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
    let icon = new St.Icon({ icon_name: 'network-cellular-hspa-symbolic', style_class: 'system-status-icon' });
    hbox.add_child(icon);

    this.container.actor.add_actor(hbox);
    this.container.actor.add_style_class_name('panel-status-button');

    this.container.actor.connect('button-press-event', Lang.bind(this, function() {
      this._refresh();
    }));

    Main.panel.addToStatusArea('HotelManager', this.container);
  },

  _getCommand: function() {
    let command = 'hotel';
    let homeDir = GLib.get_home_dir();
    let hotelRc = homeDir + '/.hotelrc';

    if (GLib.file_test(hotelRc, GLib.FileTest.EXISTS)) {
      hotelRc = GLib.file_get_contents(hotelRc);

      if (hotelRc[0] == true) {
        let userCommand = hotelRc[1].toString().split("\n")[0];
        userCommand = userCommand.replace('~', homeDir);

        if (userCommand != '') {
          command = userCommand;
        }
      }
    }

    return command;
  },

  _getUrl: function (action, id) {
    let paths = {
      start:   '/_/servers/${id}/start',
      stop:    '/_/servers/${id}/stop',
      servers: '/_/servers'
    };

    let path = this._uri + paths[action].toString().replace('${id}', id);
    return path;
  },

  _checkHotel: function () {
    let running = GLib.spawn_command_line_sync('ps -ef').toString().match(/hotel/);
    return running == 'hotel';
  },

  _toggleHotel: function (start) {
    let action  = start ? 'start' : 'stop';
    let command = this._getCommand();

    Util.spawn([command, action]);
  },

  _reloadHotel: function () {
    this._toggleHotel(false);
    this._toggleHotel(true);
  },

  _checkServer: function (server) {
    let running = server['status'];
    return running == 'running';
  },

  _toggleServer: function (id, start) {
    let action = start ? 'start' : 'stop';
    let url    = this._getUrl(action, id);

    GLib.spawn_command_line_sync('curl --request POST ' + url);
  },

  _reloadServer: function (id) {
    this._toggleServer(id, false);
    this._toggleServer(id, true);
  },

  _openServerUrl: function (id) {
    let url = 'http://' + id + '.dev';
    Util.spawn(['xdg-open', url]);
  },

  _getServers: function () {
    let items = {};

    if (this._running) {
      let url  = this._getUrl('servers');
      let list = GLib.spawn_command_line_sync('curl ' + url);

      try {
        items = JSON.parse(list[1].toString());
      } catch (e) {
        items = {};
      }
    }

    return items;
  },

  _addServerItems: function () {
    let servers = Object.keys(this._entries);

    if (servers.length) {
      this.container.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      servers.map(Lang.bind(this, function(id, index) {
        let server     = this._entries[id];
        let active     = this._checkServer(server);
        let serverItem = new PopupServerItem(id, active, { 'restartButton': true, 'launchButton': true });

        this.container.menu.addMenuItem(serverItem);

        serverItem.connect('toggled', Lang.bind(this, function() {
          this._toggleServer(id, !active);
        }));

        serverItem.restartButton.connect('clicked', Lang.bind(this, function() {
          this._reloadServer(id);
          this.container.menu.close();
        }));

        serverItem.launchButton.connect('clicked', Lang.bind(this, function() {
          this._openServerUrl(id);
        }));
      }));
    }
  },

  _refresh: function() {
    this.container.menu.removeAll();

    this._running = this._checkHotel();
    this._entries = this._getServers();

    let options = {
      'autoCloseMenu': true,
      'restartButton': true,
      'launchButton':  true
    };

    let hotelItem = new PopupServerItem('Hotel', this._running, options);
    this.container.menu.addMenuItem(hotelItem);

    Mainloop.idle_add(Lang.bind(this, this._addServerItems));

    hotelItem.connect('toggled', Lang.bind(this, function() {
      this._toggleHotel(!this._running);
    }));

    hotelItem.restartButton.connect('clicked', Lang.bind(this, function() {
      this._reloadHotel();
      this.container.menu.close();
    }));

    hotelItem.launchButton.connect('clicked', Lang.bind(this, function() {
      this._openServerUrl('hotel');
    }));

    return true;
  },

  destroy: function() {
    this.container.destroy();
  }
});

let hotelManager;

function enable() {
  hotelManager = new HotelManager();
}

function disable() {
  hotelManager.destroy();
}
