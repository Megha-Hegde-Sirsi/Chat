let socket = io();
let from;
let to;

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
$(document).ready(function () {
    console.log('Page loaded', $('#message-form-1'));
    from = GetParameterValues('name');
    to = GetParameterValues('room');
    function GetParameterValues(param) {
        var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < url.length; i++) {
            var urlparam = url[i].split('=');
            if (urlparam[0] == param) {
                // return urlparam[1];  
                console.log('url item', urlparam[1]);
                window.rcvr = urlparam[1];
                console.log('global', window.rcvr);
            }
        }
    }
    $('#message-form-1').on('submit', function (e) {//event argument
        // $('#message-form').submit(function(e){
        e.preventDefault();
        let messageTextbox = $('[name=message]')
        console.log(messageTextbox);
        socket.emit('createPrivateMessage', {
            text: messageTextbox.val()
        }, function () {
            //acknowledgement
            messageTextbox.val('');
        });
    });
    $('#send-location').on('click', function () {
        if (!navigator.geolocation) {
            return alert('Geolocation not supported by your browser');
        } else {
            $('#send-location').attr('disabled', 'disabled').text('Sending Location...');
            navigator.geolocation.getCurrentPosition(function (position) {
                $('#send-location').removeAttr('disabled').text('Send Location');
                socket.emit('createPrivateLocationMessage', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }, window.rcvr );
            }
                , function () {
                    locationButton.removeAttr('disabled').text('Send Location');
                    alert('Unable to fetch location');
                });
        }
    });

})
