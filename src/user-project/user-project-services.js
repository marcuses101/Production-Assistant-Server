const UserProjectServices = {
  async addEntry(knex, { user_id, project_id }) {
    return ( await knex
      .into("user_project")
      .insert({ user_id, project_id })
      .returning("*"))[0];
  },
  async removeEntry(knex,{user_id,project_id}){
    return knex('user_project').where({user_id,project_id}).delete();
  }
};

module.exports = { UserProjectServices };
