'use strict';

const db = require('../db.js');
const { NotFoundError, BadRequestError } = require('../expressError');
const Job = require('./job.js');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************************** create */

describe('create', function() {
  const newJob = {
    title: 'test',
    salary: 10,
    equity: '0.1',
    companyHandle: 'c1',
  };

  test('works', async function() {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });
  });
});

/******************************** findAll */
// TODO: Update relevant tests with company names
describe("findAll", function() {
  test('works with no filters', async function() {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'j1',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      },
      {
        id: jobIds[1],
        title: 'j2',
        salary: 2,
        equity: '0.2',
        companyHandle: 'c2',
      },
      {
        id: jobIds[2],
        title: 'j3',
        salary: 3,
        equity: '0.3',
        companyHandle: 'c3',
      },
      {
        id: jobIds[3],
        title: 'j4',
        salary: null,
        equity: null,
        companyHandle: 'c3',
      },
    ]);
  });

  test('works with title filter', async function() {
    const jobs = await Job.findAll({ title: 'j1' });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'j1',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      }
    ]);
  });

  test('works with minSalary filter', async function() {
    const jobs = await Job.findAll({ minSalary: 3 });
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'j3',
        salary: 3,
        equity: '0.3',
        companyHandle: 'c3',
      }
    ]);
  });

  test('works with hasEquity true filter', async function() {
    const jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'j1',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      },
      {
        id: jobIds[1],
        title: 'j2',
        salary: 2,
        equity: '0.2',
        companyHandle: 'c2',
      },
      {
        id: jobIds[2],
        title: 'j3',
        salary: 3,
        equity: '0.3',
        companyHandle: 'c3',
      }
    ]);
  });
// TODO: add last company
  test('works with hasEquity false filter', async function() {
    const jobs = await Job.findAll({ hasEquity: false });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'j1',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      },
      {
        id: jobIds[1],
        title: 'j2',
        salary: 2,
        equity: '0.2',
        companyHandle: 'c2',
      },
      {
        id: jobIds[2],
        title: 'j3',
        salary: 3,
        equity: '0.3',
        companyHandle: 'c3',
      }
    ]);
  });

  test('works with all filters', async function() {
    const jobs = await Job.findAll({
      hasEquity: true,
      minSalary: 3,
      title: 'j3'
    });
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'j3',
        salary: 3,
        equity: '0.3',
        companyHandle: 'c3',
      },
    ]);
  });
});

/******************************** get */
// TODO: add company info
describe('get', function() {
  test('works', async function() {
    const job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: 'j1',
      salary: 1,
      equity: '0.1',
      companyHandle: 'c1',
    });
  });

  test('404 if no matching job', async function() {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************** update */

describe('update', function() {
  test('works', async function() {
    const newData = {
      title: 'update',
      salary: 4,
      equity: '0.4',
    }
    const updatedJob = await Job.update(jobIds[0], newData);
    expect(updatedJob).toEqual({
      id: jobIds[0],
      title: 'update',
      salary: 4,
      equity: '0.4',
      companyHandle: 'c1'
    });
  });

  test('bad request if no update data', async function() {
    try {
      await Job.update(jobIds[0], {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test('not found if no job', async function() {
    try {
      await Job.update(0, { title: 'Not found' });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************** remove */

describe('remove', function() {
  test('works', async function() {
    await Job.remove(jobIds[0]);
    const response = await db.query(
      `SELECT id FROM jobs WHERE id=$1`, [jobIds[0]]
    );
    expect(response.rows.length).toEqual(0);
  });

  test('404 if no job', async function() {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});