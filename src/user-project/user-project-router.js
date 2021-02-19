const express = require("express");
const { UserProjectServices } = require("./user-project-services");
const UserProjectRouter = express.Router();

UserProjectRouter.route("/")
  .post(async (req, res, next) => {
    const { project_id, user_id } = req.body;
    if (!project_id || !user_id)
      return res
        .status(400)
        .json({ error: { message: "project_id and user_id are required" } });
    try {
      const entry = await UserProjectServices.addEntry(req.app.get("db"), {
        user_id,
        project_id,
      });
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { project_id, user_id } = req.body;
    if (!project_id || !user_id)
      return res
        .status(400)
        .json({ error: { message: "project_id and user_id are required" } });
    try {
      await UserProjectServices.removeEntry(req.app.get('db'),{user_id,project_id});
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  module.exports = {UserProjectRouter}