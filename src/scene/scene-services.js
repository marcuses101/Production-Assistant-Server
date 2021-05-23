const columns = [
  "id",
  "name",
  "description",
  "date",
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
  async addItemToScene(knex,entry){
    return (await knex
      .into('scene_item')
      .insert(entry)
      .returning('*'))[0]
  },
  async removeItemFromScene(knex,{scene_id,item_id}){
    return knex('scene_item')
      .where({scene_id,item_id})
      .delete();
  }
};

module.exports = { SceneServices };
