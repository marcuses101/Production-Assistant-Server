const TABLE = "item_acquisition";
const COLUMNS = ["id", "item_id as itemId", "acquisition_id as acquisitionId"];

const ItemAcquisitionServices = {
  async getProjectEntries(knex, project_id) {
    return knex(TABLE)
      .join("acquisitions", "acquisitions.id", "item_acquisition.acquisition_id")
      .where("acquisitions.project_id", "=", project_id)
      .select("item_acquisition.item_id", "item_acquisition.acquisition_id");
  },
  async addEntry(knex, { item_id, acquisition_id }) {
    return (
      await knex
        .into(TABLE)
        .insert({ item_id, acquisition_id })
        .returning(COLUMNS)
    )[0];
  },
  async removeEntry(knex, { item_id, acquisition_id }) {
    return knex(TABLE).where({ item_id, acquisition_id }).delete();
  },
};

module.exports = { ItemAcquisitionServices };
