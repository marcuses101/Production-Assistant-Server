const ProjectServices = {
  async getUserProjects(knex, user_id) {
    return knex("projects")
      .join("user_project", "user_project.project_id", "projects.id")
      .where("user_project.user_id", user_id)
      .select("projects.id", "projects.name", "projects.budget");
  },

  async getProjectById(knex, id) {
    return knex.select("*").from("projects").where({ id }).first();
  },
  async addProject(knex, project) {
    return (await knex.into("projects").insert(project).returning("*"))[0];
  },
  async updateProject(knex, project) {
    return (
      await knex("projects")
        .where({ id: project.id })
        .update(project)
        .returning("*")
    )[0];
  },
  async removeProject(knex, id) {
    return knex("projects").delete().where({ id });
  },
};

module.exports = { ProjectServices };
