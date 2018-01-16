const expect = require('expect');
const {isRealString} = require('./validation');

describe('isRealString', () => {
  it('Should reject non-string values', () => {
    expect(isRealString(33)).toBe(false).toBeA('boolean');
  });
  it('Should reject strings with only spaces', () => {
    expect(isRealString('    ')).toBe(false);
  });
  it('Should allow strings with non-space characters', () => {
    expect(isRealString('  woojae ')).toBe(true);
  });
});
