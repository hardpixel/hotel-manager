const GLib            = imports.gi.GLib;
const GObject         = imports.gi.GObject;
const St              = imports.gi.St;
const Main            = imports.ui.main;
const PanelMenu       = imports.ui.panelMenu;
const PopupMenu       = imports.ui.popupMenu;
const ExtensionUtils  = imports.misc.extensionUtils;
const HotelLauncher   = ExtensionUtils.getCurrentExtension();
const Helpers         = HotelLauncher.imports.helpers;
const PopupServerItem = HotelLauncher.imports.popupServerItem.PopupServerItem;
const Util            = imports.misc.util;

var HotelManager = new GObject.Class({
  Name: 'HotelManager',
  Extends: PanelMenu.Button,
  _entries: {},
  _running: false,

  _init() {
    this._config = this._hotelConfig();
    this._uri    = this._hotelUri();

    this.parent(0.0, 'HotelManager');

    this.icon = new St.Icon({
      icon_name: 'network-cellular-hspa-symbolic',
      style_class: 'system-status-icon'
    });

    this.add_actor(this.icon);

    this.menu.connect('open-state-changed', () => {
      this._refresh()
    });

    this._refresh();
  },

  _hotelConfig() {
    let config = '~/.hotel/conf.json';
    let data   = { port: 2000, host: '127.0.0.1', tld: 'localhost' };

    return Helpers.fileGetContents(config, data, true);
  },

  _hotelUri() {
    let host = this._config.host;
    let port = this._config.port;

    return host + ':' + port;
  },

  _getCommand() {
    let command = Helpers.fileGetLine('~/.hotelrc', 0, 'hotel');
    return Helpers.getFilePath(command);
  },

  _getUrl(action, id) {
    let paths = {
      start:   '/_/servers/${id}/start',
      stop:    '/_/servers/${id}/stop',
      servers: '/_/servers'
    };

    return this._uri + paths[action].replace('${id}', id);
  },

  _checkHotel() {
    let running = Helpers.commandGetOutput('ps -ef').match(/hotel\/lib\/daemon/);
    return running == 'hotel/lib/daemon';
  },

  _toggleHotel(start) {
    let action  = start ? 'start' : 'stop';
    let command = this._getCommand();

    Util.spawn([command, action]);
  },

  _checkServer(server) {
    return server.status && server.status == 'running';
  },

  _toggleServer (id, start) {
    let action = start ? 'start' : 'stop';
    let url    = this._getUrl(action, id);

    GLib.spawn_command_line_sync('curl --request POST ' + url);
  },

  _openServerUrl (id) {
    let url = 'http://' + id + '.' + this._config.tld;
    Util.spawn(['xdg-open', url]);
  },

  _getServers() {
    let items = {};

    if (this._running) {
      let url = this._getUrl('servers');
      items = Helpers.commandGetOutput('curl ' + url, true);
    }

    return items;
  },

  _addServerItems() {
    let servers = Object.keys(this._entries);
    if (!servers.length) return;

    let separator = new PopupMenu.PopupSeparatorMenuItem();
    this.menu.addMenuItem(separator);

    servers.forEach((id, index) => {
      let server     = this._entries[id];
      let active     = this._checkServer(server);
      let options    = { restartButton: true, launchButton: true };
      let serverItem = new PopupServerItem(id, active, options);

      this.menu.addMenuItem(serverItem.widget);

      serverItem.widget.connect('toggled', (button, state) => {
        this._toggleServer(id, state);
        this._setServerItemState(button, id);
      });

      serverItem.launchButton.connect('clicked', (event) => {
        this._openServerUrl(id);
        this.menu.close();
      });
    });
  },

  _setServerItemState(serverItem, server) {
    serverItem.setSensitive(false);

    this._entries = this._getServers();
    let curServer = this._entries[server];

    serverItem.setToggleState(this._checkServer(curServer));
    serverItem.setSensitive(true);
  },

  _setHotelItemState(hotelItem) {
    this._running = this._checkHotel();

    hotelItem.setToggleState(this._running);
    hotelItem.setSensitive(true);
  },

  _refresh() {
    this.menu.removeAll();

    this._running = this._checkHotel();
    this._entries = this._getServers();

    let options = {
      autoCloseMenu: true,
      restartButton: true,
      launchButton:  true
    };

    let hotelItem = new PopupServerItem('Hotel', this._running, options);
    this.menu.addMenuItem(hotelItem.widget);

    this._addServerItems();

    hotelItem.widget.connect('toggled', (button, state) => {
      this._toggleHotel(state);
      this._setHotelItemState(button);
    });

    hotelItem.launchButton.connect('clicked', () => {
      this._openServerUrl('hotel');
      this.menu.close();
    });
  }
});

let hotelManager;

function enable() {
  hotelManager = new HotelManager();
  Main.panel.addToStatusArea('hotelManager', hotelManager);
}

function disable() {
  hotelManager.destroy();
  hotelManager = null;
}
