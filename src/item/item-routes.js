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
      const { project_id } = req.query;
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
      const item = {project_id,name,description, source, low_estimate,high_estimate,quantity}
      const databaseItem = await ItemServices.addItem(req.app.get('db'),item)
      res.status(201).location().json(serializeItem(databaseItem));
    } catch (error) {
      next(error);
    }
  });

ItemRouter.route("/:item_id")
.all(async (req,res,next)=>{
  try {
    const {item_id} = req.params;
    const item = await ItemServices.getItemById(
      req.app.get("db"),
      item_id
    )
  } catch (error) {
    
  }
})
;

module.exports = { ItemRouter };
