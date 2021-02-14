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

SceneRouter.route("/").get(async (req, res, next) => {
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
});

SceneRouter.route('/:scene_id')
.all(async(req,res,next)=>{
  try {
    const {scene_id} =  req.params;
    console.log({scene_id})
    const scene = await SceneServices.getSceneById(req.app.get('db'),scene_id);
    if (!scene) return res.status(404).json({error:{message:'scene not found'}})
    req.scene = serializeScene(scene);
    next()
  } catch (error) {
    next(error)
  }
})
.get(async(req,res,next)=>{
  res.json(req.scene)
})

module.exports = { SceneRouter };
