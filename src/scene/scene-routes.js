const express = require("express");
const xss = require("xss");
const { SceneServices } = require("./scene-services");
const SceneRouter = express.Router();

function serializeScene(scene) {
  return {
    ...scene,
    name: xss(scene.name),
    description: xss(scene.description),
  };
}

SceneRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const { project_id } = req.query;
      if (!project_id) {
        return res
          .status(400)
          .json({ error: { message: "'project_id' query string required" } });
      }
      const scenes = await SceneServices.getProjectScenes(
        req.app.get("db"),
        project_id
      );
      res.json(scenes.map(serializeScene));
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { name, description, project_id, date } = req.body;
      const scene = { name, description, project_id };
      for (const [key, value] of Object.entries(scene)) {
        if (!value)
        return res.status(400).json({ error: { message: `${key} is required` } });
      }
      scene.date = date;
      const databaseScene = await SceneServices.addScene(
        req.app.get("db"),
        scene
      );
      res
        .status(201)
        .location(`${req.baseUrl}/${databaseScene.id}`)
        .json(serializeScene(databaseScene));
    } catch (error) {
      next(error);
    }
  });

SceneRouter.route('/item')
  .post(async(req,res,next)=>{
    try {
      const {scene_id,item_id} = req.body
      if (!scene_id || !item_id) {
        return res.status(404).json({ error: { message:`"scene_id" and "item_id" required` } });
      }
      const entry = await SceneServices.addItemToScene(
        req.app.get('db'),
        {scene_id,item_id}
      )
      res.json(entry);
    } catch (error) {
      next(error)
    }
  })
  .delete(async(req,res,next)=>{
    try {
      const {scene_id,item_id} = req.body
      if (!scene_id || !item_id) {
        return res.status(404).json({ error: { message:`"scene_id" and "item_id" required` } });
      }
      await SceneServices.removeItemFromScene(
        req.app.get('db'),
        {scene_id,item_id}
      )
      res.status(200).json({message:`scene_id: ${scene_id} item_id: ${item_id} deleted`})
    } catch (error) {
      next(error)
    }
  })

SceneRouter.route("/:scene_id")
  .all(async (req, res, next) => {
    try {
      const { scene_id } = req.params;
      const scene = await SceneServices.getSceneById(
        req.app.get("db"),
        scene_id
      );
      if (!scene)
        return res.status(404).json({ error: { message: "scene not found" } });
      req.scene = serializeScene(scene);
      next();
    } catch (error) {
      next(error);
    }
  })
  .get(async (req, res, next) => {
    try {
      res.json(req.scene);
    } catch (error) {
      next(error);
    }
  })
  .patch(async(req,res,next) => {
    try {
      const {name,description,date} = req.body
      const scene = {name,description,date}
      if (!Object.values(scene).some(Boolean)) {
        res.status(400).json({error:{message:'name, description, or shoot_date required'}})
        return
      }
      scene.date = date;
      const updatedScene = await SceneServices.updateScene(
        req.app.get('db'),
        req.scene.id,
        scene
      )
      res.json(updatedScene)
    } catch (error) {
      next(error)
    }
  })
  .delete(async(req,res,next)=>{
    try {
      await SceneServices.removeScene(req.app.get('db'),req.scene.id);
      res.status(200).json({message:`scene id:${req.scene.id} removed`})
    } catch (error) {
      next(error)
    }
  })

module.exports = { SceneRouter };
