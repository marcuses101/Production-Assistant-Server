const express = require("express");
const ItemAcquisitionRouter = express.Router();
const { ItemAcquisitionServices } = require("./item-acquisition-services");

ItemAcquisitionRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const { project_id } = req.query;
      if (!project_id)
        return res
          .status(400)
          .json({
            error: { message: `'project_id' query string is required` },
          });
      const itemAcquisitions = await ItemAcquisitionServices.getProjectEntries(
        req.app.get("db"),
        project_id
      );
      res.json(itemAcquisitions);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    const { item_id, acquisition_id } = req.body;
    try {
      if (!item_id || !acquisition_id) {
        return res.status(400).json({
          error: { message: "item_id and acquisition_id is required" },
        });
      }
      const entry = await ItemAcquisitionServices.addEntry(req.app.get("db"), {
        item_id,
        acquisition_id,
      });
      res.status(201).json(entry);
    } catch (error) {
      if (error.code === "23505")
        return res.status(400).json({
          error: {
            message: `item_id: ${item_id}, acquisition_id: ${acquisition_id} entry already exists.`,
          },
        });
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { item_id, acquisition_id } = req.body;
      if (!item_id || !acquisition_id) {
        return res.status(400).json({
          error: { message: "item_id and acquisition_id is required" },
        });
      }
      await ItemAcquisitionServices.removeEntry(req.app.get("db"), {
        item_id,
        acquisition_id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = { ItemAcquisitionRouter };
