const columns = [
  "id",
  "project_id as projectId",
  "name",
  "description",
  "source",
  "low_estimate as lowEstimate",
  "high_estimate as highEstimate",
  "quantity",
];

const ItemServices = {
  async getProjectItems(knex, project_id) {
    return knex.select(columns).where({ project_id }).from("items");
  },
  async getAcquisitionItems(knex, acquisition_id) {
    return knex("items")
      .join("item_acquisition", { "items.id": "item_acquisition.item_id" })
      .where("item_acquisition.acquisition_id", acquisition_id)
      .select(
        "items.id",
        "items.project_id as projectId",
        "items.name",
        "items.description",
        "items.source",
        "items.low_estimate as lowEstimate",
        "items.high_estimate as highEstimate",
        "items.quantity"
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
