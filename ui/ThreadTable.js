var blessed = require('blessed');

function ThreadTable (screen) {
  var self = this;

  if (!(self instanceof ThreadTable)) return new ThreadTable(screen);

  opts = {
    parent: screen,
    left: 0,
    top: 0,
    width: '30%',
    height: '100%',
    noCellBorders: true,
    border: {
        type: 'line',
        left: true,
        top: true,
        right: false,
        bottom: true
    },
    align: 'left',
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    style: {
        header: {
        fg: 'blue',
        bold: true
        },
        cell: {
        fg: '#4CD964',
        selected: {
            bg: 'gray'
        }
        }
    }
  }
  blessed.widget.ListTable.call(self, opts);
  self.init();
}
ThreadTable.prototype.__proto__ = blessed.widget.ListTable.prototype;

ThreadTable.prototype.init = function () {
  var self = this;
  
  self.setLabel({text:'Threads',side:'left'});
  
};

module.exports = ThreadTable;