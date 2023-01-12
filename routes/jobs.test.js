'use strict';

const request = require("supertest");

const app = require("../app");


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "JOB",
    salary: 7,
    equity: ".7",
    companyHandle: "c1"
  };

  test("ok for admin", async function() {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        ...newJob
      }
    });
  });

  test("fail for non-admin", async function() {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          salary: 7
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "JOB",
          salary: -1,
          equity: ".7",
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      companies:
          [
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
              companyHandle: 'c4',
            }
          ],
    });
  });

  test("works with one filter", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({minSalary: 2})
    expect(resp.body).toEqual({
      companies:
          [
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
          ],
    });
  });

  test("works with all filters", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query( {minSalary: 2, hasEquity: true, title: "j3"} )
    expect(resp.body).toEqual({
      companies:
          [
            {
              id: jobIds[2],
              title: 'j3',
              salary: 3,
              equity: '0.3',
              companyHandle: 'c3',
            }
          ]
    });
  });

  test("fails: wrong key", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({title: "j1", test: "wrong"});
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: 'j1',
        salary: 1,
        equity: '0.1',
        companyHandle: 'c1',
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

