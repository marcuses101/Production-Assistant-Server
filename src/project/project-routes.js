const express = require("express");
const {
  UserProjectServices,
} = require("../user-project/user-project-services");
const { ProjectServices } = require("./project-services");
const ProjectRouter = express.Router();
const xss = require("xss");

function serializeProject(project) {
  return {
    ...project,
    name: xss(project.name),
    description: xss(project.description),
  };
}

ProjectRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const projects = await ProjectServices.getUserProjects(
        req.app.get("db"),
        req.user_id
      );
      res.json(projects.map((project) => serializeProject(project)));
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const database = req.app.get("db");
      const {name, description, budget} = req.body;
      const project = {name,description,budget};
      for (let [key,value] of Object.entries(project)) {
        if (!value) return res.status(400).json({error:{message:`"${key} is required"`}})
      }
      const databaseProject = await ProjectServices.addProject(
        database,
        project
      );
      await UserProjectServices.addEntry(database, {
        user_id: req.user_id,
        project_id: databaseProject.id,
      });
      res.status(201).json(databaseProject);
    } catch (error) {
      next(error);
    }
  });

ProjectRouter.route("/:project_id")
  .all(async (req, res, next) => {
    try {
      const { project_id } = req.params;
      const project = await ProjectServices.getProjectById(
        req.app.get("db"),
        project_id
      );
      req.project = serializeProject(project);
      next();
    } catch (error) {
      next(error);
    }
  })
  .get(async (req, res) => {
    res.json(req.project);
  })
  .patch(async (req, res, next) => {
    try {
      const { name, description, budget } = req.body;
      const updatedProject = await ProjectServices.updateProject(
        req.app.get("db"),
        { name, description, budget, id: req.project.id }
      );
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req,res,next)=>{
    try {
      await ProjectServices.removeProject(req.app.get('db'),req.project.id)
      res.status(200).json({message:`Project id:${req.project.id} removed`})
    } catch (error) {
      next(error)
    }
  });

module.exports = { ProjectRouter };
