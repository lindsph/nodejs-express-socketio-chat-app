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

// options
const { displayName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// // receive event server is sending
socket.on('message', ({displayName, text, createdAt}) => {
    // console.log(message);
    const html = Mustache.render(messageTemplate, {
        displayName,
        message: text,
        createdAt: moment(createdAt).format('dddd h:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', ({displayName, url, createdAt}) => {
    const html = Mustache.render(locationTemplate, {
        displayName,
        url,
        createdAt: moment(createdAt).format('dddd h:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.emit('join', { displayName, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/"
    }
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