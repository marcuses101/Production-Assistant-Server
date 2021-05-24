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
const { assignIds, camelCaseKeys } = require("./testUtil");
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
  describe("GET /api/item", () => {
    context("given the database is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and project items", async () => {
        const projectId = 1;
        const expectedItems = assignIds(makeItemsArray())
          .filter((item) => item.project_id === projectId)
          .map(camelCaseKeys);

        const { body } = await supertest(app)
          .get(`/api/item?project_id=${projectId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql(expectedItems);
      });
      it("responds with status 200 and acquisition items", async () => {
        const acquisitionId = 3;
        const expectedItems = assignIds(makeItemsArray())
          .filter((item) => item.acquisition_id === acquisitionId)
          .map(camelCaseKeys);
        const { body } = await supertest(app)
          .get(`/api/item?acquisition_id=${acquisitionId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql(expectedItems);
      });
      it("responds with status 200 and scene items", async () => {
        const sceneId = 1;
        const items = assignIds(makeItemsArray());
        const sceneEntries = makeSceneItemsArray().filter(
          ({ scene_id }) => scene_id === sceneId
        );
        const expectedItems = sceneEntries.map(({ item_id }) =>
          items.find((item) => item.id === item_id)
        );
        const { body } = await supertest(app)
          .get(`/api/item?scene_id=${sceneId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);

        expect(body).to.eql(expectedItems.map(camelCaseKeys));
      });
    });
  });

  describe("POST route", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 201 and adds the item", async () => {
        const newItem = {
          name: "testScene",
          quantity: 50,
          description: "Do sint magna labore ex aute culpa do.",
          project_id: 1,
          acquisition_id: null,
          acquired: false,
        };
        const expectedItem = assignIds([...makeItemsArray(), newItem]).slice(
          -1
        )[0];
        const { body } = await supertest(app)
          .post("/api/item")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newItem)
          .expect(201);
        expect(body).to.eql(camelCaseKeys(expectedItem));
      });
    });
  });

  describe("GET /api/item/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the requested item", async () => {
        const id = 4;
        const expectedItem = camelCaseKeys(
          assignIds(makeItemsArray()).find((item) => item.id === id)
        );
        const { body } = await supertest(app)
          .get(`/api/item/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql(expectedItem);
      });
    });
  });

  describe("PATCH /api/item/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the updated item", async () => {
        const id = 4;
        const description = "new description";
        const expectedItem = {
          ...camelCaseKeys(
            assignIds(makeItemsArray()).find((scene) => scene.id === id)
          ),
          description,
        };
        const { body } = await supertest(app)
          .patch(`/api/item/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ description })
          .expect(200);
        expect(body).to.eql(expectedItem);
      });
    });
  });

  describe("DELETE api/item/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and deletes the item", async () => {
        const id = 4;
        const expectedItems = assignIds(makeItemsArray()).filter(
          (item) => item.id !== id
        );
        await supertest(app)
          .delete(`/api/item/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbItems = await db.select("*").from("items");
        expect(dbItems).to.eql(expectedItems);
      });
    });
  });
});
