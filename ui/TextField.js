var blessed = require('blessed');

function TextField (screen) {
  var self = this;

  if (!(self instanceof TextField)) return new TextField(screen);

  opts = {
    parent: screen,
    left: '30%-1',
    bottom: 0,
    width: '70%+2',
    height: '15%',
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
  blessed.widget.Textarea.call(self, opts);
  self.init();
}
TextField.prototype.__proto__ = blessed.widget.Textarea.prototype;

TextField.prototype.init = function () {
  var self = this;
  
  self.setLabel({text:'Response',side:'left'});

  self.on('click', function(){
    self.focus();
  });
};

module.exports = TextField;