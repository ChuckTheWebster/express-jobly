const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate: Takes in data to update and returns the
 *
 * SQL statement to be used for updating in a SET clause (or throws
 * an error if there is no specified data to update).
 *
 * dataToUpdate: object {field: value, field: value, ...}
 *  ex: {numEmployees: 4}
 * jsToSql: object {javascriptColName: sqlColName, ...}
 *  ex: {numEmployees: num_employees}
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
