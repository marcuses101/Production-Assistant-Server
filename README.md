# Production Assistant API

**[Live Site](https://production-assistant.vercel.app/)**  
**[Frontend Repo](https://github.com/marcuses101/Production-Assistant-Frontend)**
**[Server](https://production-assistant-server.herokuapp.com)**

## Summary

![application](./frontend-screen.png)

Used with the frontend Production Assistant Application, this REST API helps film producers keep their projects organized. Manage scenes, items, acquisitions. Keep track of the project's budget, status of the upcoming scene, and items left to acquire.

## Endpoints

**"\*": indicates required**

### /api/user

| Route           | Request | Body                     | Result                                               |
| --------------- | ------- | ------------------------ | ---------------------------------------------------- |
| /api/user       | POST    | username*<br/> password* | creates new user                                     |
| /api/user/login | POST    | username*<br/> password* | returns an access token required to access club data |

---

### /api/user-project

| Route             | Request | Header               | Body                      | Result                                        |
| ----------------- | ------- | -------------------- | ------------------------- | --------------------------------------------- |
| /api/user-project | POST    | Authorization: token | user_id*<br/> project_id* | creates new entry associating user to project |
| /api/user-project | DELETE  | Authorization: token | user_id*<br/> project_id* | removes the entry associating user to project |

---

### /api/project

| Route            | Request | Header               | Body                                    | Result                                           |
| ---------------- | ------- | -------------------- | --------------------------------------- | ------------------------------------------------ |
| /api/project     | GET     | Authorization: token |                                         | returns projects associated to logged in user    |
| /api/project     | POST    | Authorization: token | name <br/> description<br/> budget<br/> | creates and returns new project JSON             |
| /api/project/:id | GET     | Authorization: token |                                         | returns project located at id as JSON            |
| /api/project/:id | PATCH   | Authorization: token | name <br/> description<br/> budget<br/> | update and returns project located at id as JSON |
| /api/project/:id | DELETE  | Authorization: token |                                         | removes project located at id                    |

---

### /api/scene

| Route           | Request | Header               | Body                                             | Query Params | Result                                         |
| --------------- | ------- | -------------------- | ------------------------------------------------ | ------------ | ---------------------------------------------- |
| /api/scene      | GET     | Authorization: token |                                                  | project_id\* | returns JSON array of project scenes           |
| /api/scene      | POST    | Authorization: token | name*<br/>description*<br/>project_id\*<br/>date |              | returns JSON of created scene                  |
| /api/scene/item | POST    | Authorization: token | scene_id*<br/>item_id*                           |              | creates an entry associating item to scene     |
| /api/scene/item | DELETE  | Authorization: token | scene_id*<br/>item_id*                           |              | removes an entry associating item to scene     |
| /api/scene/:id  | GET     | Authorization: token |                                                  |              | returns scene located at id as JSON            |
| /api/scene/:id  | PATCH   | Authorization: token | name<br/>description<br/>project_id<br/>date     |              | update and returns scene located at id as JSON |
| /api/scene/:id  | DELETE  | Authorization: token |                                                  |              | removes project located at id                  |

---

### /api/item

| Route     | Request | Header | Body | Query Params | Result |
| --------- | ------- | ------ | ---- | ------------ | ------ |
| /api/item | GET     | Authorization: token | *ONE of:* <br/>project_id<br/>acquisition_id<br/>scene_id<br/> | | returns JSON array of items associated to query parameters |
| /api/item | POST    | Authorization: token | project_id*<br/>name*<br/>description<br/>acquired<br/>acquisition_id<br/>quantity<br/>|  | creates and return new item as JSON |
| /api/item/:id | GET     | Authorization: token | | | returns item located at id as JSON |
| /api/item/:id | PATCH   | Authorization: token | project_id<br/>name\*<br/>description<br/>acquired<br/>acquisition_id<br/>quantity<br/> |  | update and returns item located at id as JSON |
| /api/item/:id | DELETE  | Authorization: token |   |  | removes item located at id |

---

### /api/acquisition

| Route | Request | Header | Body | Query Params | Result |
| ----- | ------- | ------ | ---- | ------------ | ------ |
| /api/acquisition | GET | Authorization: token | | project_id* | returns a JSON array of project acquisitions |
| /api/acquisition | POST | Authorization: token | project_id*<br/>total*<br/>acquisition_type*: *purchase, rental, constuction*<br/>date | | creates and return new acquisition as JSON |
| /api/acquisition/:id | GET |  Authorization: token | | | returns the acquisition located at id as JSON |
| /api/acquisition/:id | PATCH |  Authorization: token | project_id*<br/>total*<br/>acquisition_type*: *purchase, rental, constuction*<br/>date | | update and returns the acquisition located at id as JSON |
| /api/acquisition/:id | DELETE |  Authorization: token | | | removes acquisition located at id |

## Tech

- JavaScript
- Node.js
- Express.js
- Postgres

---

## Author Information

### Marcus Connolly

- [Portfolio](https://marcus-connolly.com)
- [LinkedIn](www.linkedin.com/in/marcus-connolly-web)
- [GitHub](www.github.com/marcuses101)
- [Email](mailto:mnjconnolly@gmail.com)



