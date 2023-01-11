'use strict';

const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql');

describe('sqlForPartialUpdate', function() {
  test('changing multiple values', function() {
    const result = sqlForPartialUpdate(
      {testField: 'testValue', testField2: 'testValue2'},
      {testField: 'test_field', testField2: 'test_field2'}
    );
    expect(result).toEqual({
      setCols: '"test_field"=$1, "test_field2"=$2',
      values: ['testValue', 'testValue2']
    });
  });

  test("Doesn't work with no body", function() {
    const t = () => {
      sqlForPartialUpdate({})
    };
    expect(t).toThrow(BadRequestError);
  });
});