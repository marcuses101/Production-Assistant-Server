const { expect } = require("chai");
const supertest = require("supertest");
const knex = require("knex");
const app = require("../src/app");
const { makeUserArray } = require("./fixtures/user.fixtures");
const { makeProjectArray } = require("./fixtures/project.fixtures");
const { makeUserProjectArray } = require("./fixtures/user-project.fixtures");
const { assignIds } = require("./testUtil");

describe("project endpoints", () => {
  let db = {};
  let accessToken = {};
  function cleanup() {
    return db.raw(
      "TRUNCATE users, projects, user_project RESTART IDENTITY CASCADE"
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
  describe("GET route", () => {
    context("given the database is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and projects associated to user", async () => {
        const user = assignIds(makeUserArray())[0];
        const projects = await db.select("*").from("projects");
        const expectedProjects = makeUserProjectArray()
          .filter(({ user_id }) => user_id === user.id)
          .map(({ project_id }) =>
            projects.find((project) => project.id === project_id)
          );
        const { body } = await supertest(app)
          .get("/api/project")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql(expectedProjects);
      });
    });
  });
  describe("POST route", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 201 and adds the project", async () => {
        const newProject = {
          name: "testProject",
          description: "Do sint magna labore ex aute culpa do.",
          budget: 600,
        };
        const {
          body: { name, description, budget },
        } = await supertest(app)
          .post("/api/project")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(newProject)
          .expect(201);
        expect({ name, description, budget }).to.eql(newProject);
      });
    });
  });
  describe("GET route/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the requested project", async () => {
        const expectedProject = makeProjectArray()[0];
        const { body } = await supertest(app)
          .get("/api/project/1")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql({ ...expectedProject, id: 1 });
      });
    });
  });
  describe("PATCH route/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and the updated project", async () => {
        const projectToUpdate = makeProjectArray()[0];
        const description = 'test description'
        const { body } = await supertest(app)
          .patch("/api/project/1")
          .send({description})
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        expect(body).to.eql({ ...projectToUpdate, id: 1, description });
      });
    });
  });
  describe("DELETE api/project/:id", () => {
    context("given the db is populated", () => {
      beforeEach(populate);
      afterEach(cleanup);
      it("responds with status 200 and deletes the project", async () => {
        const expectedProjects = makeProjectArray()
          .map((project,index)=>({...project,id:index+1}))
          .filter(({id})=>id!==1);
        await supertest(app)
          .delete("/api/project/1")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);
        const dbProjects = await db.select('*').from('projects');
        expect(dbProjects).to.eql(expectedProjects);
      });
    });
  });
});
