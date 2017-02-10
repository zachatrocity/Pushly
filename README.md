# Pushly

This is a simple TUI pushbullet app. It is extremely WIP. Looking for contributors also. 
This uses [blessed](https://github.com/chjj/blessed) for the TUI stuff.

![Text Based PushBullet](https://raw.githubusercontent.com/zachatrocity/Pushly/master/pushly.png)

Right now you can:
- Load threads
- Load a thread's messages
- Send a message in a thread

Thats about it.

## Setup

- `npm install`
- [Click here to generate an access token ](https://www.pushbullet.com/authorize?client_id=ZyMIJTsp8pIip53MXwkJFSxd7QQlp6lr&redirect_uri=https%3A%2F%2Fwww.pushbullet.com%2Flogin-success&response_type=token&scope=everything)
- Copy access token from the url and set `ACCESS_TOKEN` to that value in the `index.js`
- Run: ``` curl --header 'Access-Token: <your_access_token_here>' \
     https://api.pushbullet.com/v2/devices ```
- Copy the `iden` value from the curl response and set `TARGET_DEVICE` to that value in the `index.js` file.
- Run `node index.js`


## Things to do:
- [x] Hookup the stream/socket (https://docs.pushbullet.com/#realtime-event-stream)
- [ ] Add support for encryption
- [x] Modularize the code into multiple files
- [x] Add linebreaks to messages
- [x] Add notifications (https://github.com/mikaelbr/node-notifier)
- [ ] Add images to the notifications
- [x] Get textarea to refocus after focus is lost
- [ ] Get access token rather than hard code it
- [ ] indicate focus change (highlight the border of the active box)
- [X] Add support for group messages
- [ ] Add support for MMS messages (perhaps a link?)
- [ ] Tons more