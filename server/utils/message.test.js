const expect = require('expect');

var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () => {
  it('should generate correct message object', () => {
    var from = 'Woojae',
        text = 'Hello'
    var message = generateMessage(from, text);

    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({from, text});
  });
})

describe('generateLocationMessage', () => {
  it('should generate correct location object', () => {
    var from = 'Woojae',
        lat = 1,
        lng = 1;
    var url = 'https://www.google.com/maps?q=1,1';
    var message = generateLocationMessage(from, lat, lng);
    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({from, url});
  });
});
