const express = require("express");
const { TOKEN_SECRET } = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRouter = express.Router();
const {UserServices} = require("./user-services");

UserRouter.route("/")

  .post(async (req, res, next) => {
    const { username, password } = req.body;
    try {

      if (!username)
        return res
          .status(400)
          .json({ error: { message: "username required" } });
      if (!password)
        return res
          .status(400)
          .json({ error: { message: "password required" } });

      const hashedPassword = await bcrypt.hash(password, 10);
      await UserServices.addUser(req.app.get("db"), {
        username,
        password: hashedPassword,
      });
      return res.status(201).json({message:'user created'});
    } catch (error) {
      console.log('error code',error.code)
      if (error.code == 23505){
        return res.status(409).json({error:{message:`${username} already exist`}})
      }
      next(error);
    }
  });

UserRouter.route("/login").post(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ error: { message: "username and password required" } });
    const dbUser = await UserServices.getUserByUsername(
      req.app.get("db"),
      username
    );
    if (!dbUser) {
      return res.status(400).json({ error: { message: "username not found" } });
    }
    if (!(await bcrypt.compare(password, dbUser.password)))
      return res.status(400).json({ error: { message: "invalid password" } });
    const accessToken = jwt.sign({ username, user_id:dbUser.id }, TOKEN_SECRET);
    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

module.exports = {UserRouter};
