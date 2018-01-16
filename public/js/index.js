let socket = io();
$(document).ready(function () {
  let roomchat = true;
  $('#rooms').on('click', 'li', function () {
    console.log(this.innerText)
    jQuery('[name=room').val(this.innerText);
    roomchat = true;
    $('#room').val(this.innerText);
    $('#joinBtn').click();
  });

  $('#chat-login').submit(function () {
    if (roomchat) {
      $('#chat-login').attr('action', '../chat.html');
    } else {
      $('#chat-login').attr('action', '../privateChat.html');
    }
  })

  $('#users').on('click', 'li', function () {
    console.log(this.innerText);
    $('#room').val(this.innerText);
    roomchat = false;
    $('#privateBtn').click();
  });
});

$(document).ready(function () {
  $('#users').on('click', 'li', function () {
    console.log(this.innerText);
    $('#room').val(this.innerText);
  })
})

socket.on('connect', function () {
  console.log('connected!');
  //UPDATE ROOM LIST - index.html
  socket.on('updateRoomList', function (rooms) {
    let ol = $('<ol id="rooms"></ol>');
    rooms.forEach(function (room) {
      ol.append($('<li style="cursor:pointer"></li>').text(room));
    });
    $('#rooms').html(ol);

    // Adding number icon showing available rooms
    let span = $('#available-room').children("span");
    let availableRoomNum = rooms.length;
    span.html(`<a class="ui tag tiny label">${availableRoomNum}</a>`);
  });

  socket.on('getUserListIndex', function (users) {
    console.log(users);
    let ol = $('<ol id="users"></ol>');
    users.forEach(function (user) {
      ol.append($('<li style="cursor:pointer"></li>').text(user));
      $('#users').html(ol);
    });

    let span = $('#available-users').children("span");
    let availableUserNum = users.length;
    span.html(`<a class="ui tag tiny label">${availableUserNum}</a>`)
  });
});