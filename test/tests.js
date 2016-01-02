import {assert} from 'chai';

import {fixPunctuation} from 'util/jservice';

describe('jservice', () => {
  describe('fixPunctuation', () => {
    it('strips backslashes', () => {
      assert.equal(fixPunctuation('a\\b\\c'), 'abc');
    });
    it('pads slashes', () => {
      assert.equal(fixPunctuation('a/b /c/ d'), 'a / b / c / d');
    });
    it('tightens parentheses', () => {
      assert.equal(fixPunctuation('a ( b ) c ('), 'a (b) c (');
    });
    it('creates em-dashes', () => {
      assert.equal(fixPunctuation('a--b --c'), 'a\u2014b\u2014c');
    });
    it('turns & into and', () => {
      assert.equal(fixPunctuation('a&b &c'), 'a and b and c');
    });
    it('compresses whitespace', () => {
      assert.equal(fixPunctuation('a  b c'), 'a b c');
    });
    it('pads commas', () => {
      assert.equal(fixPunctuation('a,b,c'), 'a, b, c');
      assert.equal(fixPunctuation('5,000,000'), '5,000,000');
    });
    it('pads colons', () => {
      assert.equal(fixPunctuation('a:b:c'), 'a: b: c');
      assert.equal(fixPunctuation('8:59'), '8:59');
    });
  });
});
