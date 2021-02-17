const TABLE = "item_acquisition";
const COLUMNS = ["id", "item_id as itemId", "acquisition_id as acquisitionId"];

const ItemAcquisitionServices = {
  async addEntry(knex, { item_id, acquisition_id }) {
    return (await knex
      .into(TABLE)
      .insert({ item_id, acquisition_id })
      .returning(COLUMNS))[0];
  },
 async removeEntry(knex, { item_id, acquisition_id }){
   return knex(TABLE).where({item_id,acquisition_id}).delete();
 },
};

module.exports = { ItemAcquisitionServices };
