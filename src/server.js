const app = require("./app");
const {NODE_ENV} = require("./config")
const knex = require('knex')
const { PORT, DATABASE_URL } = require("./config");

const db = knex({
  client: 'pg',
  connection:NODE_ENV==='development'?{
    connectionString:DATABASE_URL
  }:{
    connectionString:DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
})

app.set('db',db)

app.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
