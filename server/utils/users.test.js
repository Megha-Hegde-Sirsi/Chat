const expect = require('expect');

const {Users} = require('./users');

describe('Users', () => {
  var users;
  beforeEach(() => {
    users = new Users();
    users.users = [{
      id: '1',
      name: 'Mike',
      room: 'Node Study'
    }, {
      id: '2',
      name: 'Jen',
      room: 'Korean Study'
    }, {
      id: '3',
      name: 'Julie',
      room: 'Node Study'
    }]
  });

  it('should add new user', () => {
    var users = new Users();
    var user = {
      id: '123',
      name: 'Woojae',
      room: 'The Office Fans'
    };
    var resUser = users.addUser(user.id, user.name, user.room);
    expect(users.users).toEqual([user]);
  });

  it('should remove a user', () => {
    var removedUser = users.removeUser('1');
    expect(removedUser.id).toBe('1');
    expect(users.users.length).toBe(2);
  });

  it('should not remove a user', () => {
    var removedUser = users.removeUser('0');
    expect(removedUser).toNotExist();
    expect(users.users.length).toBe(3);
  });

  it('should find user', () => {
    var foundUser = users.getUser('2');
    expect(foundUser).toBe(users.users[1]);
  });

  it('should not find user', () => {
    var foundUser = users.getUser('0');
    expect(foundUser).toNotExist();
  });

  it('should return names for Node Study', () => {
    var userList = users.getUserList('Node Study');
    expect(userList).toEqual(['Mike', 'Julie']);
  });

  it('should return names for Korean Study', () => {
    var userList = users.getUserList('Korean Study');
    expect(userList).toEqual(['Jen']);
  })
});
