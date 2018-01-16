
class Users {
    constructor() {
      this.users = [];
      this.roomList = [];
    }
    addUser(id, from, to) {
      let user = { id,from, to };
      this.users.push(user);
      return user;
    }
  
    getUser(id) {
      return this.users.find((user) => user.id === id);
    }
    getPrivateUser(){

    }
  }
  
  module.exports = { Users };
  