const { expect } = require("chai");
const supertest = require("supertest");
const knex = require("knex");
const app = require("../src/app");
const { makeUserArray } = require("./fixtures/user.fixtures");
const { makeProjectArray } = require("./fixtures/project.fixtures");
const { makeUserProjectArray } = require("./fixtures/user-project.fixtures");
const { makeScenesArray } = require("./fixtures/scene.fixtures");
const {makeSceneItemsArray} = require("./fixtures/scene-item.fixtures");
const {makeItemsArray} = require('./fixtures/item.fixtures')
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
      "TRUNCATE users, projects, user_project, scenes, acquisition , items, scene_item RESTART IDENTITY CASCADE"
    );
  }
  async function populate() {
    await db.into("users").insert(makeUserArray());
    await db.into("projects").insert(makeProjectArray());
    await db.into("user_project").insert(makeUserProjectArray());
    await db.into("scenes").insert(makeScenesArray());
    await db.into('acquisitions').insert(makeAcquisitionsArray())
    await db.into('items').insert(makeItemsArray());
    await db.into('scene_item').insert(makeSceneItemsArray())
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
  describe("GET /api/scene", () => {
    context("given the database is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and project scenes", async () => {
        const projectId = 1;
        const expectedScenes = assignIds(makeScenesArray())
          .filter((scene) => scene.project_id === projectId)
          .map(camelCaseKeys);

        const { body } = await supertest(app)
          .get(`/api/scene?project_id=${projectId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbScenes = convertDatesArray(body);
        expect(dbScenes).to.eql(expectedScenes);
      });
    });
  });
  describe("POST route", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 201 and adds the scene", async () => {
        const newScene = {
          name: "testScene",
          description: "Do sint magna labore ex aute culpa do.",
          project_id: 1,
        };
        const {
          body: { name, description, projectId: project_id },
        } = await supertest(app)
          .post("/api/scene")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newScene)
          .expect(201);
        expect({ name, description, project_id }).to.eql(newScene);
      });
    });
  });
  describe("GET /api/scene/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the requested project", async () => {
        const id = 4;
        const expectedScene = camelCaseKeys(
          assignIds(makeScenesArray()).find((scene) => scene.id === id)
        );
        const { body } = await supertest(app)
          .get(`/api/scene/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const scene = convertDate(body);
        expect(scene).to.eql(expectedScene);
      });
    });
  });
  describe("PATCH /api/scene/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the updated scene", async () => {
        const id = 4;
        const description = 'new description'
        const expectedScene = {...camelCaseKeys(
          assignIds(makeScenesArray()).find((scene) => scene.id === id)
        ),description};
        const { body } = await supertest(app)
          .patch(`/api/scene/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({description})
          .expect(200);
        const scene = convertDate(body);
        expect(scene).to.eql(expectedScene);
      });
    });
  });

  describe("DELETE api/scene/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and deletes the scene", async () => {
        const id = 4;
        const expectedScenes =
          assignIds(makeScenesArray()).filter(scene=>scene.id!==id);
        await supertest(app)
          .delete(`/api/scene/${id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbScenes = convertDatesArray(await db.select('*').from('scenes'));
        expect(dbScenes).to.eql(expectedScenes);
      });
    });
  });

  describe("POST api/scene/item",()=>{
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the created entry", async () => {
        const newEntry = {scene_id:4,item_id:4};
        const {body} = await supertest(app)
          .post(`/api/scene/item`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newEntry)
          .expect(200);
        const {scene_id,item_id} = body
        expect({scene_id,item_id}).to.eql(newEntry);
      });
    });
  })

  describe("DELETE api/scene/item",()=>{
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 removes the entry", async () => {
        const entryToDelete = {scene_id:1,item_id:1}
        const expectedEntries = assignIds(makeSceneItemsArray())
        .filter(({scene_id,item_id})=>!(scene_id===entryToDelete.scene_id && item_id===entryToDelete.item_id));

        await supertest(app)
          .delete(`/api/scene/item`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(entryToDelete)
          .expect(200);
        const dbEntries = await db.select('*').from('scene_item');
        expect(dbEntries).to.eql(expectedEntries);
      });
    });
  })

});
