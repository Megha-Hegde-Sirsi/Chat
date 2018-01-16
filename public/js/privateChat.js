let socket = io();
// const socket = require('socket.io');

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

socket.on('connect', function () {
    console.log('Connected to server');
    let params = jQuery.deparam(window.location.search);
    console.log(params);
    socket.emit('privateChat', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    });
});

//DISCONNECT
socket.on('disconnect', function () {
    console.log('disconnected from server');
    window.location.href = '/';
});

socket.on('newMessage', function (message) {
    let formattedTime = moment(message.createdAt).format('h:mm a');
    let template = $('#message-template').html();
    let html = Mustache.render(template, {
        text: message.text,
        from: `<a class="ui ${message.color} small label inactiveLink">${message.from}</a>`,
        createdAt: formattedTime
    });
    $('#messages').append(html);
    scrollToBottom(); 
});

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
// $('#message-form').submit(function(e){
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
let locationButton = $('#send-location');
$('#send-location').on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    } else {
        locationButton.attr('disabled', 'disabled').text('Sending Location...');
        navigator.geolocation.getCurrentPosition(function (position) {
            locationButton.removeAttr('disabled').text('Send Location');
            socket.emit('createLocationMessage', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }
            , function () {
                locationButton.removeAttr('disabled').text('Send Location');
                alert('Unable to fetch location');
            });
    }
});