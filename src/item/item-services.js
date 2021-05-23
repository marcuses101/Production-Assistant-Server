const columns = [
  "id",
  "project_id as projectId",
  "name",
  "description",
  "quantity",
  'acquisition_id as acquisitionId',
  'acquired'
];

const ItemServices = {
  async getProjectItems(knex, project_id) {
    return knex.select(columns).where({ project_id }).from("items");
  },
  async getSceneItems(knex, scene_id) {
    return knex.select(columns)
      .from('items')
      .join('scene_item',{'scene_item.item_id':'items.id'})
      .where('scene_item.scene_id',scene_id)
  },
  async getAcquisitionItems(knex, acquisition_id) {
    return knex("items")
      .join("acquisitions", { "items.acquisition_id": "acquisitions.id" })
      .where("acquisitions.id", acquisition_id)
      .select(
        "items.id",
        "items.project_id as projectId",
        "items.name",
        "items.description",
        "items.source",
        "items.low_estimate as lowEstimate",
        "items.high_estimate as highEstimate",
        "items.quantity",
        'items.acquisition_id as acquisitionId',
        'items.acquired'
      );
  },
  async getItemById(knex, id) {
    return knex.select(columns).from("items").where({ id }).first();
  },
  async addItem(knex, item) {
    return (await knex.into("items").insert(item).returning(columns))[0];
  },
  async updateItem(knex, id, item) {
    return (
      await knex("items").where({ id }).update(item).returning(columns)
    )[0];
  },
  async removeItem(knex, id) {
    return knex("items").where({ id }).delete();
  },
};

module.exports = { ItemServices };
