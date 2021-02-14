const SceneServices = {
  async getProjectScenes(knex, project_id) {
    return knex.select("*").from("scenes").where({ project_id });
  },
  async getSceneById(knex, scene_id) {
    return knex.select("").from("scenes").where({ id: scene_id }).first();
  },
};

module.exports = { SceneServices };
