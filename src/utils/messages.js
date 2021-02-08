const generateMessage = (displayName, text) => {
    return {
        displayName,
        text,
        createdAt: new Date().getTime()
    }
};

const generateLocationMessage = (displayName, coordinatesArray) => {
    return {
        displayName,
        url: `https://www.google.com/maps?q=${coordinatesArray[0]},${coordinatesArray[1]}`,
        createdAt: new Date().getTime()
    }
};

module.exports = {
    generateMessage,
    generateLocationMessage
}