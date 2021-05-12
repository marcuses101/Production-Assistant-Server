const express = require("express");
const {
  ItemAcquisitionServices,
} = require("../item-acquisition/item-acquisition-services");
const AcquisitionRouter = express.Router();
const { AcquisitionServices } = require("./acquisition-services");

AcquisitionRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const { project_id, scene_id } = req.query;
      if (!project_id === !scene_id)
        return res.status(400).json({
          error: {
            message: `'project_id' OR 'scene_id' query string is required`,
          },
        });
      const acquisitions = await AcquisitionServices.getProjectAcquisitions(
        req.app.get("db"),
        project_id
      );
      const itemAcquisitions = await ItemAcquisitionServices.getProjectEntries(
        req.app.get("db"),
        project_id
      );
      acquisitions.map((acquisition) => {
        acquisition.items = itemAcquisitions.reduce((items, object) => {
          return object.acquisition_id === acquisition.id
            ? [...items, object.item_id]
            : items;
        }, []);
        return acquisition;
      });
      res.json(acquisitions);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { project_id, total_cost } = req.body;
      const acquisition = { project_id, total_cost };
      console.log(req.body)
      if (!Object.values(acquisition).some(Boolean))
        return res.status(400).json({
          error: { message: "project_id and total_cost are required" },
        });
      const databaseAcquisition = await AcquisitionServices.addAcquisition(
        req.app.get("db"),
        acquisition
      );
      res.status(201).json(databaseAcquisition);
    } catch (error) {
      next(error);
    }
  });

AcquisitionRouter.route("/:acquisition_id")
  .all(async (req, res, next) => {
    try {
      const { acquisition_id } = req.params;
      const acquisition = await AcquisitionServices.getAcquisitionById(
        req.app.get("db"),
        acquisition_id
      );
      if (!acquisition)
        return res.status(400).json({
          error: {
            message: `acquisition with id '${acquisition_id}' does not exist`,
          },
        });
      req.acquisition = acquisition;
      next();
    } catch (error) {
      next(error);
    }
  })
  .get((req, res) => res.json(req.acquisition))
  .patch(async (req, res, next) => {
    try {
      const { id } = req.acquisition;
      const { total_cost } = req.body;
      if (typeof total_cost !== "number")
        return res
          .status(400)
          .json({ error: { message: "total_cost is required" } });
      const updatedAcquisition = await AcquisitionServices.updateAcquisition(
        req.app.get("db"),
        id,
        { total_cost }
      );
      res.json(updatedAcquisition);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { id } = req.acquisition;
      await AcquisitionServices.removeAcquisition(req.app.get("db"), id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = { AcquisitionRouter };
