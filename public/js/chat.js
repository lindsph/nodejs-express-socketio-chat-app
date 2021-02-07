const socket = io();

// elements
const chatMessageForm = document.querySelector('.chat-message-form');
const chatMessageInput = chatMessageForm.querySelector('#chat-message');
const chatMessageButton = chatMessageForm.querySelector('.chat-message-submit');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// // receive event server is sending
socket.on('message', (message) => {
    // console.log(message);
    const html = Mustache.render(messageTemplate, {
        message
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (url) => {
    // console.log(url)
    const html = Mustache.render(locationTemplate, {
        url
    });
    messages.insertAdjacentHTML('beforeend', html);
});

const fetchLocation = async () => {
    const res = await fetch('https://location.services.mozilla.com/v1/geolocate?key=test')
        .then(response => response.json())

    const point = [res.location.lat, res.location.lng]
    return point;
};

chatMessageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // disable form
    chatMessageButton.setAttribute('disabled', true);

    socket.emit('messageSent', chatMessageInput.value, (error) => {
        // enable form
        chatMessageButton.removeAttribute('disabled');
        chatMessageInput.value = '';
        chatMessageInput.focus();

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!');
    });
});

document.querySelector('#send-location').addEventListener('click', async (event) => {
    sendLocationButton.setAttribute('disabled', true);
    const coords = await fetchLocation();

    socket.emit('sendLocation', coords);
    sendLocationButton.removeAttribute('disabled');
});
