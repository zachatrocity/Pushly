var blessed = require('blessed')
  , screen;
var unirest = require('unirest');
var open = require('open');
const notifier = require('node-notifier');

var ThreadTable = require('./ui/ThreadTable');
var MessagesTable = require('./ui/MessagesTable');
var TextField = require('./ui/TextField');

var threads = [[ 'ID', 'Name',  'Message',  'Time']];
var thread_lookup = {};
var activeThreadId = '';
var ACCESS_TOKEN = 'o.2VHAXKj16SYnTIaBW3Wwu8IMDHs7J4oB'
var TARGET_DEVICE = 'ujv5QM4Sl7QsjzW4aHTNF6';

screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
  warnings: true
});

//UI components
var thread_table = new ThreadTable(screen);
var message_table = new MessagesTable(screen);
var text_input = new TextField(screen);


unirest.get('https://api.pushbullet.com/v2/permanents/' + TARGET_DEVICE + '_threads')
.headers({'Access-Token': ACCESS_TOKEN, 'Content-Type': 'application/json'})
.send()
.end(function (response) {
  for (var index = 0; index < response.body.threads.length; index++) {
      var thread = response.body.threads[index];
      var recipient = '';
      thread.recipients.forEach(function(elm, i){
          if (i < thread.recipients.length - 1){
              recipient += (elm.name + ', ')
          } else {
              recipient += elm.name
          }
      })
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
                var items = ("{#007AFF-fg}You:{/} " + msg).match(new RegExp('.{1,' + (message_table.width - 1) + '}', 'g'));
                for (var i = 0; i < items.length; i++){
                    message_table.addItem(items[i] + '\n');
                }
            } else {
                if(response.body.thread[index].image_urls){
                    //it has images
                    for (x = 0; x < response.body.thread[index].image_urls.length; x++){
                        msg = response.body.thread[index].image_urls + '\n' + msg;
                    }
                }
                var recipient_idx = response.body.thread[index].recipient_index != undefined ? response.body.thread[index].recipient_index : 0;
                name = thread_lookup[thread_id].recipients[recipient_idx].name;
                
                var items = ("{#4CD964-fg}" + name + "{/}: " + msg).match(new RegExp('.{1,' + (message_table.width - 1) + '}', 'g'));
                for (var i = 0; i < items.length; i++){
                    message_table.addItem(items[i] + '\n');
                }
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
    text_input.readInput();
    screen.render();
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
            text_input.clearValue();
            text_input.readInput();
        }
    });

}

screen.key('q', function() {
  return screen.destroy();
});

screen.render();

