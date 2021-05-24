const columns = ["id", "project_id as projectId", "total", "date", "acquisition_type as acquisitionType"];

const AcquisitionServices = {
  getProjectAcquisitions(knex, project_id) {
    return knex.select(columns).from("acquisitions").where({ project_id });
  },
  getAcquisitionById(knex, id) {
    return knex.select(columns).from("acquisitions").where({ id }).first();
  },
  async addAcquisition(knex, acquisition) {
    return (
      await knex.into("acquisitions").insert(acquisition).returning(columns)
    )[0];
  },
  async updateAcquisition(knex, id, acquisition) {
    return (
      await knex("acquisitions")
        .update(acquisition)
        .where({ id })
        .returning(columns)
    )[0];
  },
  removeAcquisition(knex, id) {
    return knex("acquisitions").where({ id }).delete();
  },
};

module.exports = { AcquisitionServices };
