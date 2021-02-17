ALTER TABLE user_project
ADD CONSTRAINT unique_project_id_user_id UNIQUE (project_id,user_id);