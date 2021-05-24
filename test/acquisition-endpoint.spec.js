const { expect } = require("chai");
const supertest = require("supertest");
const knex = require("knex");
const app = require("../src/app");
const { makeUserArray } = require("./fixtures/user.fixtures");
const { makeProjectArray } = require("./fixtures/project.fixtures");
const { makeUserProjectArray } = require("./fixtures/user-project.fixtures");
const { makeScenesArray } = require("./fixtures/scene.fixtures");
const { makeSceneItemsArray } = require("./fixtures/scene-item.fixtures");
const { makeItemsArray } = require("./fixtures/item.fixtures");
const {
  assignIds,
  camelCaseKeys,
  convertDatesArray,
  convertDate,
} = require("./testUtil");
const { makeAcquisitionsArray } = require("./fixtures/acquisition.fixtures");

describe("scene endpoints", () => {
  let db = {};
  let accessToken = {};
  function cleanup() {
    return db.raw(
      "TRUNCATE users, projects, user_project, scenes, acquisitions , items, scene_item RESTART IDENTITY CASCADE"
    );
  }
  async function populate() {
    await db.into("users").insert(makeUserArray());
    await db.into("projects").insert(makeProjectArray());
    await db.into("user_project").insert(makeUserProjectArray());
    await db.into("scenes").insert(makeScenesArray());
    await db.into("acquisitions").insert(makeAcquisitionsArray());
    await db.into("items").insert(makeItemsArray());
    await db.into("scene_item").insert(makeSceneItemsArray());
  }

  before("make knex instance", async () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
    await cleanup();
    await populate();
    const { body: jwt } = await supertest(app)
      .post("/api/user/login")
      .send({ username: "userOne", password: "password" });
    accessToken = jwt.accessToken;
    await cleanup();
    return;
  });

  after(() => {
    db.destroy();
  });
  beforeEach(cleanup);
  afterEach(cleanup);
  describe("GET /api/acquisition", () => {
    context("given the database is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);

      it("responds with status 200 and project acquisitions", async () => {
        const projectId = 1;
        const expectedAcquisitions = assignIds(makeAcquisitionsArray())
          .filter((acquisition) => acquisition.project_id === projectId)
          .map(camelCaseKeys);

        const { body } = await supertest(app)
          .get(`/api/acquisition?project_id=${projectId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbAcquisitions = convertDatesArray(body);
        expect(dbAcquisitions).to.eql(expectedAcquisitions);
      });
    });
  });

  describe("POST route", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 201 and the added acquisition", async () => {
        const newAcquisitions = {
          project_id: 1,
          total: 500,
          acquisition_type: "rental",
          date: "2020-05-01",
        };
        const expectedAcquisition = camelCaseKeys(
          assignIds([...makeAcquisitionsArray(), newAcquisitions]).slice(-1)[0]
        );

        const { body } = await supertest(app)
          .post("/api/acquisition")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newAcquisitions)
          .expect(201);
        const dbAcquisition = convertDate(body);
        expect(dbAcquisition).to.eql(camelCaseKeys(expectedAcquisition));
      });
    });
  });

  describe("GET /api/acquisition/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the requested acquisition", async () => {
        const id = 4;
        const expectedAcquisition = camelCaseKeys(
          assignIds(makeAcquisitionsArray()).find(
            (acquisition) => acquisition.id === id
          )
        );
        const { body } = await supertest(app)
          .get(`/api/acquisition/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbAcquisition = convertDate(body);
        expect(dbAcquisition).to.eql(expectedAcquisition);
      });
    });
  });

  describe("PATCH /api/acquisition/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the updated acquisition", async () => {
        const id = 4;
        const acquisition_type = "construction";
        const expectedAcquisition = camelCaseKeys({
          ...assignIds(makeAcquisitionsArray()).find(
            (acquisition) => acquisition.id === id
          ),
          acquisition_type,
        });

        const { body } = await supertest(app)
          .patch(`/api/acquisition/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ acquisition_type })
          .expect(200);
        const dbAcquisition = convertDate(body);
        expect(dbAcquisition).to.eql(expectedAcquisition);
      });
    });
  });

  describe("DELETE api/acquisition/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and removes the acquisition", async () => {
        const id = 4;
        const expectedAcquisitions = assignIds(makeAcquisitionsArray()).filter(
          (acquisition) => acquisition.id !== id
        );
        await supertest(app)
          .delete(`/api/acquisition/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbAcquisitions = convertDatesArray(await db.select("*").from("acquisitions"));
        expect(dbAcquisitions).to.eql(expectedAcquisitions);
      });
    });
  });
});
