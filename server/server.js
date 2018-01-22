const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const linkifyHtml = require('linkifyjs/html');

const { generateMessage, generateLocationMessage, privateLink } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));
io.on('connection', (socket) => {
  io.emit('updateRoomList', users.getRoomList());

  socket.on('join', (params, callback) => {
    params.room = params.room.toLowerCase();
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }
    if (users.getUsernameList(params.room).includes(params.name)) {
      return callback('Same name already exists in that room!');
    }
    if (params.name === 'Admin' || params.name === 'admin') {
      return callback('You cannot be an Admin.');
    }
    let format = /[!@?#&+=$]/;
    let checkSpecialChar = (str) => {
      return format.test(str);
    }
    if (checkSpecialChar(params.name)) {
      return callback('Your username contains illegal characters.');
    }
    if (checkSpecialChar(params.room)) {
      return callback('Your roomname contains illegal characters.');
    }

    if (params.name.length > 20 || params.room.length > 20) {
      console.log(params.name.length);
      return callback('Username and roomname cannot be more than 20 characters.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    users.addRoom(params.room);

    io.emit('updateRoomList', users.getRoomList());
    io.emit('getUserListIndex', users.getUserListIndex());
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Admin', `Welcome to the chat app, ${params.name}.`, 'red'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`, 'red'));
    callback();
  });

  socket.on('privateChat', (params, callback) => {
    let user1 = users.getNewIdPrivate(params.name, params.room);
    let user2 = users.getUserId(params.room, params.name);
    console.log(user1, user2);
    try {
      if (user1 == undefined && user2 == undefined) {
        users.addUser(socket.id, params.name, params.room);
        let user2 = users.getNewId(params.room);
        console.log(user2);
        io.to(user2).emit('privateInvitation', privateLink(params.name, params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
        socket.emit('newMessage', generateMessage('Admin', `Your chat invitation has been succesfully sent to ${params.room}`));
        // socket.emit('newMessage', generateMessage('Admin', 'Your invitation is still pending'));
      } else {
        users.addUser(socket.id, params.name, params.room + 'new');
        let user2 = users.getUserId(params.room, params.name);
        console.log(user2);
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
        // io.to(user2).emit('newMessage', generateMessage('Admin', `Your invitation has been accepted by ${params.name}`));
      }
    } catch (err) {
      socket.emit('newMessage', 'An error has occured');
    }
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    // console.log(message, message.room)
    let user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      message.text = linkifyHtml(message.text, { defaultProtocol: 'https' });
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createPrivateMessage', (message, callback) => {
    let user = users.getUser(socket.id);
    console.log(message, socket.id, user.room);
    console.log('sender', user);
    let user2 = users.getNewIdId(user.room);
    // window.temp=user2.id;
    console.log('receiver', user2);
    if (user.id === user2.id) {
      // let temp = user2.id;
      let user2 = users.getNew(user.name);
      console.log('rcvr', user2);
      io.to(user2.id).emit('newMessage', generateMessage(user.name, message.text));
      socket.emit('newMessage', generateMessage(user.name, message.text));
      callback();
    } else {
      io.to(user2.id).emit('newMessage', generateMessage(user.name, message.text));
      socket.emit('newMessage', generateMessage(user.name, message.text));
      callback();
    }
  });

  socket.on('createPrivateLocationMessage', (coords, to) => {
    let user = users.getUser(socket.id);
    console.log('geosender', user);
    let user2 = users.getUserId(user.name, to);
    console.log('georeceiver', user2);
    if (user.id === user2.id) {
      user2 = users.getNewSocket(to);
      console.log('newgeo', user2);
      io.to(user2).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
      socket.emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    } else {
      io.to(user2.id).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
      socket.emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
    let user = users.removeUser(socket.id);

    if (user) {
      io.of('/').in(user.room).clients((err, clients) => {
        if (err) throw error;
        if (clients.length < 1) {
          users.removeRoom(user.room);
          io.emit('updateRoomList', users.getRoomList());
        }
      });
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
  });
});

server.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});


