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
