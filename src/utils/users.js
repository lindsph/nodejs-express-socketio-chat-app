let users = [];

const addUser = ({id, displayName, room}) => {
    // every single connection to the server has a unique id generated for it

    // clean the data
    displayName = displayName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate
    if (!displayName || !room) {
        return {
            error: 'Please provide a display name and room!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.displayName === displayName;
    });

    // validate displayName (this user can't be added to the same room)
    if (existingUser) {
        return {
            error: 'Display name is already in use!'
        }
    }

    // store user
    const user = {
        id,
        displayName,
        room
    }

    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index) {
        return users.splice(index, 1)[0];
    }

    return undefined;
};

const getUser = (id) => {
    return users.find(user => user.id === id);
};

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}