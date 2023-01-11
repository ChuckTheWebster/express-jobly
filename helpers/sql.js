const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate: Takes in data to update and returns the
 * TODO: Be more pedantic with 'SET clause'
 * SET clause of an SQL statement to be used for updating (or throws
 * an error if there is no specified data to update).
 *
 * TODO: add example of input
 *
 * dataToUpdate: object {field: value, field: value, ...}
 * jsToSql: object {javascriptColName: sqlColName, ...}
 *
 * returns: object {
 *  setCols: 'sql statement 1, sql statement 2, ...'
 *  values: [value1, value2]
 * }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
