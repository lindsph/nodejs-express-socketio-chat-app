const socket = io();

// elements
const chatMessageForm = document.querySelector('.chat-message-form');
const chatMessageInput = chatMessageForm.querySelector('#chat-message');
const chatMessageButton = chatMessageForm.querySelector('.chat-message-submit');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
let sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const { displayName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // new message element
    const newMessage = messages.lastElementChild;

    // get the height of the newMessage
    const newMessageStyles = getComputedStyle(newMessage);
    // TODO: review once styles are added
    const newMessageMargin = parseInt(newMessageStyles.margin);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = messages.offsetHeight;

    // container height
    const containerHeight = messages.scrollHeight;

    // how far down is the user scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    // were we scrolled to the bottom before this message was added in?
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = containerHeight;
    }
};

// receive event server is sending
socket.on('message', ({displayName, text, createdAt}) => {
    const html = Mustache.render(messageTemplate, {
        displayName,
        message: text,
        createdAt: moment(createdAt).format('dddd h:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', ({displayName, url, createdAt}) => {
    const html = Mustache.render(locationTemplate, {
        displayName,
        url,
        createdAt: moment(createdAt).format('dddd h:mm:ss a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    });
    sidebar.innerHTML = html;
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

    chatMessageButton.setAttribute('disabled', true);

    socket.emit('messageSent', chatMessageInput.value, (error) => {
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