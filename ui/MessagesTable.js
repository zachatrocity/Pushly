var blessed = require('blessed');

function MessagesTable (screen) {
  var self = this;

  if (!(self instanceof MessagesTable)) return new MessagesTable(screen);

  opts = {
    parent: screen,
    left: '30%-1',
    top: 0,
    width: '70%+2',
    height: '100%',
    padding: {
        left: 2,
        top: 2,
        right: 2,
        bottom: 2
    },
    border: {
        type: 'line',
        left: true,
        top: true,
        right: true,
        bottom: true
    },
    tags: true,
    keys: true,
    vi: true,
    mouse: true
  }
  blessed.widget.List.call(self, opts);
  self.init()
}
MessagesTable.prototype.__proto__ = blessed.widget.List.prototype;

MessagesTable.prototype.init = function () {
  var self = this;
  self.setLabel({text:'Messages',side:'left'});
  
};

module.exports = MessagesTable;