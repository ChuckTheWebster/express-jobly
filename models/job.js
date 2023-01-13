'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for jobs */

class Job {
  /** Create a job, update db, return new job
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title,
                        salary,
                        equity,
                        company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Makes a where clause if filters are passed in. Throws an error if
   * search parameters are invalid. Returns object of where clause and array of values.
  *
  * filters: object {title, hasEquity, minSalary} (optional)
  *   ex: {title: 'title', hasEquity: true, minSalary: 2}
  *
  * returns: object {values: array, where: string}
  *   ex: {values: ['title', 2], where: 'WHERE title ILIKE $1 AND salary >= $2}
  */

  static #makeWhereClause(filters) {
    const { title, hasEquity, minSalary } = filters

    let values = [];
    let whereSub = [];

    if (title !== undefined) {
      whereSub.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${title}%`);
    }
    if (minSalary !== undefined) {
      whereSub.push(`salary >= $${values.length + 1}`);
      values.push(minSalary);
    }
    if (hasEquity === true) {
      whereSub.push(`equity > 0`);
    }

    let where = '';
    if (whereSub.length > 0) {
      where = `WHERE ${whereSub.join(' AND ')}`
    }

    return {values, where};
  }

  /** Find all jobs with optional search filtering.
    *
    * filters: object {title, hasEquity, minSalary} (optional keys)
    *
    * Returns [{ id, title, salary, equity, companyHandle }, ...]
    * */

   static async findAll(filters = {}) {

    const { where, values } = this.#makeWhereClause(filters);

    const jobsRes = await db.query(
      `SELECT j.id,
              j.title,
              j.salary,
              j.equity,
              j.company_handle AS "companyHandle",
              c.name AS "companyName"
          FROM jobs AS j
          JOIN companies AS c ON c.handle = j.company_handle
          ${where}
          ORDER BY title`, values);
    return jobsRes.rows;
   }

   /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
        `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [job.companyHandle]
    );

    job.company = companiesRes.rows[0];

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
        `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;