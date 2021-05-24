const express = require("express");
const AcquisitionRouter = express.Router();
const { AcquisitionServices } = require("./acquisition-services");

AcquisitionRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const { project_id } = req.query;
      if (!project_id)
        return res.status(400).json({
          error: {
            message: `'project_id' query string is required`,
          },
        });
      const acquisitions = await AcquisitionServices.getProjectAcquisitions(
        req.app.get("db"),
        project_id
      );
      res.json(acquisitions);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { project_id, total, acquisition_type, date } = req.body;
      const acquisition = { project_id, total, acquisition_type };
      for (let [key,value] of Object.entries(acquisition)) {
        if (!value) return res.status(400).json({error: {message:`"${key}" is required`}})
      }
      acquisition.date = date
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
      const { total, acquisition_type, date } = req.body;
      if (!total && !acquisition_type && !date)
        return res
          .status(400)
          .json({ error: { message: " total, acquisition_type, AND/OR date are required" } });
      const updatedAcquisition = await AcquisitionServices.updateAcquisition(
        req.app.get("db"),
        id,
        { total,acquisition_type }
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
      res.status(200).json({message:`acquisition with id: ${id} removed`});
    } catch (error) {
      next(error);
    }
  });

module.exports = { AcquisitionRouter };
