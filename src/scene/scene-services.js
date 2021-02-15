const columns = [
  "id",
  "name",
  "description",
  "shoot_date as shootDate",
  "project_id as projectId",
];

const SceneServices = {
  async getProjectScenes(knex, project_id) {
    return knex
      .select(columns)
      .from("scenes")
      .where({ project_id });
  },
  async getSceneById(knex, scene_id) {
    return knex
      .select(...columns)
      .from("scenes")
      .where({ id: scene_id })
      .first();
  },
  async addScene(knex, scene) {
    return (
      await knex
        .into("scenes")
        .insert(scene)
        .returning(columns)
    )[0];
  },
  async updateScene(knex, id, scene) {
    return (
      await knex("scenes")
        .where({ id })
        .update(scene)
        .returning(columns)
    )[0];
  },
  async removeScene(knex, id) {
    return knex("scenes").where({ id }).delete();
  },
};

module.exports = { SceneServices };
