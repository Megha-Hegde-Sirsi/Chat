let socket = io();

function scrollToBottom() {
  //Selectors
  let messages = $('#messages');
  let newMessage = messages.children('li:last-child');
  //Heights
  let clientHeight = messages.prop('clientHeight'); //jQuery alternative (cross-browser)
  let scrollTop = messages.prop('scrollTop');
  let scrollHeight = messages.prop('scrollHeight');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
};

//CONNECT
socket.on('connect', function () {
  console.log('Connected to server');
  console.log(socket.id);
  let params = $.deparam(window.location.search);
  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

//PRIVATE CHAT LISTENER
socket.on('privateInvitation', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = $('#invitation-message-template').html();
  let html = Mustache.render(template, {
    from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
    createdAt: formattedTime,
    url: message.url
  });
  $('#messages').append(html);
  scrollToBottom();
});

//DISCONNECT
socket.on('disconnect', function () {
  console.log('disconnected from server');
  window.location.href = '/';
});

//UPDATE USER LIST
socket.on('updateUserList', function (users) {
  let ol = $('<ol></ol>');
  users.forEach(function (user) {
    ol.append($(`<li>${user.name}<a class="usercolor-icon inactiveLink ui ${user.color} mini circular label"></a></li>`));
  });
  $('#users1').html(ol);

  //CHATROOM - NUMBER OF PEOPLE
  let currentPeople = $('#current-people').children('span');
  let currentPeopleNum = users.length;
  currentPeople.html(`<a class="ui grey circular label">${currentPeopleNum}</a>`);

  socket.emit('keepCurrentUserMark');
});

//NUMBER OF PEOPLE ONLINE
socket.on('getUserListIndex', function (users) {
  let ol = $('<ol></ol>');
  users.forEach(function (user) {
    ol.append($('<li></li>').text(user));
    $('#users').html(ol);
  });

});

//DISPLAY CURRENT USER
socket.on('showCurrentUser', function (userdata) {
  let currentUser = userdata.currentUser;
  let usernames = userdata.allUsernames;
  let users = userdata.allUsers;
  let currentUsername = currentUser.name;
  if (usernames[0] === currentUsername) {
    users.forEach(function (user) {
      console.log('user.name: ', user.name);
      console.log('currentUsername: ', currentUsername);
      if (!(user.name === currentUsername)) {
        $(`#users li:contains('${user.name}')`).html(`${user.name}<a class="usercolor-icon inactiveLink ui ${user.color} mini circular label"></a><i title="Kick out this user" class="remove user icon"></i>`);
      } else {
        $(`#users li:contains('${currentUsername}')`).html(`${currentUsername}<i title="You are the king of this room!" class="star icon"></i><a title="This is your color" class="usercolor-icon inactiveLink ui ${currentUser.color} mini circular label"></a><i title="This is you!" class="fa fa-user-circle-o" aria-hidden="true"></i>`);
      }
    });
  } else {
    $(`#users li:contains('${currentUsername}')`).html(`${currentUsername}<a title="This is your color" class="usercolor-icon inactiveLink ui ${currentUser.color} mini circular label"></a><i title="This is you!" class="fa fa-user-circle-o" aria-hidden="true"></i>`);
  }
});

//NEW MESSAGE LISTENER
socket.on('newMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = $('#message-template').html();
  let html = Mustache.render(template, {
    text: message.text,
    from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
    createdAt: formattedTime
  });
  $('#messages').append(html);
  // message.preventDefault();  
  scrollToBottom();
});

//GEOLOCATION LISTENER
socket.on('newLocationMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a');
  let template = $('#location-message-template').html();
  let html = Mustache.render(template, {
    from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
    createdAt: formattedTime,
    url: message.url
  });
  $('#messages').append(html);
  scrollToBottom();
});

//SEND BUTTON ACTION
$('#message-form').on('submit', function (e) {//event argument
  e.preventDefault();
  let messageTextbox = $('[name=message]')
  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    //acknowledgement
    messageTextbox.val('');
  });
});

//SEND LOCATION BUTTON ACTION
$('#send-location').on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  } else {

    $('#send-location').attr('disabled', 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function (position) {
      $('#send-location').removeAttr('disabled').text('Send Location');
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }
      , function () {
        $('#send-location').removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location');
      });
  }
});
