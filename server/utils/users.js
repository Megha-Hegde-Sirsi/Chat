class Users {
  constructor() {
    this.users = [];
    this.roomList = [];
  }

  addUser(id, name, room) {
    let user = { id, name, room };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    let user = this.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }

  getUser(id) {
    return this.users.find((user) => user.id === id);
  }

  getUserList(room) {
    let users = this.users.filter((user) => user.room === room);
    return users;
  }

  getUsernameList(room) {
    let users = this.users.filter((user) => user.room === room);
    let namesArray = users.map((user) => user.name);
    return namesArray;
  }

  getUserListIndex() {
    let users = this.users.map((user) => user.name);
    let filteredName = users.filter((user, pos) => {
      return users.indexOf(user) == pos;
    });
    return filteredName;
  }

  addRoom(room) {
    if (!this.roomList.includes(room)) {
      this.roomList.push(room);
      return room;
    }
    return null;
  }

  removeRoom(room) {
    let modifiedRoomList = this.roomList.filter((eachroom) => eachroom !== room);
    return this.roomList = modifiedRoomList;
  }

  getRoomList() {
    return this.roomList;
  }

  getUserId(name, room) {
    return this.users.filter((user) => user.name === name && user.room === room)[0];
  }

  getNewId(name) {
    return this.users.filter((user) => user.name === name)[0].id;
  }
}

module.exports = { Users };
