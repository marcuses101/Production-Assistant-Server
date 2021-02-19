const express = require("express");
const { ItemServices } = require("./item-services");
const xss = require("xss");
const ItemRouter = express.Router();

function serializeItem(item) {
  const { name, description, source } = item;
  return {
    ...item,
    name: xss(name),
    description: xss(description),
    source: xss(source),
  };
}

ItemRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const { project_id, acquisition_id, scene_id } = req.query;
      const numberOfQueries = [project_id, acquisition_id, scene_id].reduce(
        (total, current) => (current ? ++total : total),
        0
      );
      if (numberOfQueries !== 1)
        return res.status(400).json({
          error: {
            message:
              "ONE of 'project_id', 'acquisition_id', 'scene_id',  is required",
          },
        });
      if (acquisition_id) {
        const items = await ItemServices.getAcquisitionItems(
          req.app.get("db"),
          acquisition_id
        );
        return res.json(items);
      }
      const items = await ItemServices.getProjectItems(
        req.app.get("db"),
        project_id
      );
      res.json(items);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const {
        project_id,
        name,
        description,
        source,
        low_estimate,
        high_estimate,
        quantity,
      } = req.body;
      if (!project_id || !name)
        return res
          .status(400)
          .json({ error: { message: "project_id and name are required" } });
      const item = {
        project_id,
        name,
        description,
        source,
        low_estimate,
        high_estimate,
        quantity,
      };
      const databaseItem = await ItemServices.addItem(req.app.get("db"), item);
      res.status(201).location().json(serializeItem(databaseItem));
    } catch (error) {
      next(error);
    }
  });

ItemRouter.route("/:item_id")
  .all(async (req, res, next) => {
    try {
      const { item_id } = req.params;
      const item = await ItemServices.getItemById(req.app.get("db"), item_id);
      if (!item)
        return res
          .status(400)
          .json({ error: { message: `item with id ${item_id} not found` } });
      req.item = item;
      next();
    } catch (error) {
      next(error);
    }
  })
  .get((req, res) => {
    res.json(serializeItem(req.item));
  })
  .patch(async (req, res, next) => {
    try {
      const { item_id } = req.params;
      const {
        name,
        description,
        source,
        low_estimate,
        high_estimate,
        quantity,
      } = req.body;
      const bodyItem = {
        name,
        description,
        source,
        low_estimate,
        high_estimate,
        quantity,
      };
      if (!Object.values(bodyItem).some(Boolean)) {
        return res.status(400).json({
          error: {
            message:
              "Minimum one of the following properties is required: name, description, source, low_estimate, high_estimate, quantity",
          },
        });
      }
      const updatedItem = await ItemServices.updateItem(
        req.app.get("db"),
        item_id,
        bodyItem
      );
      res.status(200).json(serializeItem(updatedItem));
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { item_id } = req.params;
      await ItemServices.removeItem(req.app.get("db"), item_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = { ItemRouter };
