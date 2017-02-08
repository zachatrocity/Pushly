var blessed = require('blessed')
  , screen;
var unirest = require('unirest');

var threads = [[ 'ID', 'Name',  'Message',  'Time']];
var thread_lookup = {};
var activeThreadId = '';
var ACCESS_TOKEN = 'o.q0t9XH3U6z9707PxTfDhFGkggkjR3y2p'
var TARGET_DEVICE = 'ujv5QM4Sl7QsjzW4aHTNF6';

screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
  warnings: true
});

var thread_table = blessed.listtable({
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
});

var message_table = blessed.list({
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
});

var text_input = blessed.textarea({
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
});

thread_table.setLabel({text:'Threads',side:'left'});
message_table.setLabel({text:'Message',side:'left'})


unirest.get('https://api.pushbullet.com/v2/permanents/' + TARGET_DEVICE + '_threads')
.headers({'Access-Token': ACCESS_TOKEN, 'Content-Type': 'application/json'})
.send()
.end(function (response) {
  for (var index = 0; index < response.body.threads.length; index++) {
      var thread = response.body.threads[index];
      var recipient = thread.recipients[0].name;
      var body = '';
      var time = '';
      if (thread.latest){
        body = thread.latest.body;
        var date = new Date(thread.latest.timestamp*1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      }
      
      
      threads.push([String(thread.id), String(recipient), String(body), String(time)]);
      thread_lookup[thread.id] = thread;
  }

  thread_table.setData(threads);
  thread_table.focus();
  screen.render();
});

thread_table.on('select', function(elm, index){
    var idRegex = /(\d+)/g;
    var thread_id = idRegex.exec(elm._clines[0].trim())[1];
    message_table.clearItems();
    unirest.get('https://api.pushbullet.com/v2/permanents/' + TARGET_DEVICE + '_thread_' + thread_id)
    .headers({'Access-Token': ACCESS_TOKEN, 'Content-Type': 'application/json'})
    .send()
    .end(function (response) {
        var name='';
        for (var index = response.body.thread.length - 1; index >= 0 ; index--) {

            var msg = response.body.thread[index].body;

            if (response.body.thread[index].direction == 'outgoing'){
                message_table.addItem("{#007AFF-fg}You:{/} " + msg);
            } else {
                name = thread_lookup[thread_id].recipients[0].name;
                message_table.addItem("{#4CD964-fg}" + name + "{/}: " + msg);
            }
        }
        message_table.setLabel({text:'Message with ' + name,side:'left'})
        activeThreadId = thread_id;
    });

    message_table.focus();
    message_table.render();
    message_table.setScrollPerc(100);
    text_input.readInput();
    screen.render();
})

text_input.key('enter', sendMessage);

text_input.on('click', function(){
    text_input.focus();
});

function sendMessage(e, i){
    var msg = text_input.getContent().trim();
    var recipient = thread_lookup[activeThreadId].recipients[0].address

    var push = {
        "push": {
            "conversation_iden": recipient,
            "message": msg,
            "package_name": "com.pushbullet.android",
            "source_user_iden": "ujv5QM4Sl7Q",
            "target_device_iden": TARGET_DEVICE,
            "type": "messaging_extension_reply"
        },
        "type": "push"
    }

    //send the message
    unirest.post('https://api.pushbullet.com/v2/ephemerals')
    .headers({'Access-Token': ACCESS_TOKEN, 'Content-Type': 'application/json'})
    .send(push)
    .end(function (response) {
        if(response.code == 200){
            message_table.addItem("{#007AFF-fg}You:{/} " + JSON.parse(response.request.body).push.message);
            //scroll to bottom
            message_table.setScrollPerc(100);
        }
    });

}

screen.key('q', function() {
  return screen.destroy();
});

screen.render();

