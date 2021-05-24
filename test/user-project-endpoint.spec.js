const { expect } = require("chai");
const supertest = require("supertest");
const knex = require("knex");
const app = require("../src/app");
const { makeUserArray } = require("./fixtures/user.fixtures");
const { makeProjectArray } = require("./fixtures/project.fixtures");
const { makeUserProjectArray } = require("./fixtures/user-project.fixtures");
const {
  assignIds,
} = require("./testUtil");

describe("user-project endpoints", () => {
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


  describe("POST api/user-project",()=>{
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the created entry", async () => {
        const newEntry = {user_id:1,project_id:3};
        const expectedEntry = assignIds([...makeUserProjectArray(),newEntry]).slice(-1)[0];
        const {body} = await supertest(app)
          .post(`/api/user-project`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newEntry)
          .expect(201);
        expect(body).to.eql(expectedEntry);
      });
    });
  })

  describe("DELETE api/user-project",()=>{
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 removes the entry", async () => {
        const entryToDelete = {user_id:1,project_id:1}
        const expectedEntries = assignIds(makeUserProjectArray())
        .filter(({user_id,project_id})=>!(user_id===entryToDelete.user_id && project_id===entryToDelete.project_id));

        await supertest(app)
          .delete(`/api/user-project`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(entryToDelete)
          .expect(200);
        const dbEntries = await db.select('*').from('user_project');
        expect(dbEntries).to.eql(expectedEntries);
      });
    });
  })

});
