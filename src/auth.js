const { TOKEN_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).send("access token null");
    try {
        const {username,user_id} = jwt.verify(token, TOKEN_SECRET);
        req.username = username
        req.user_id = user_id
        next()
    } catch (error) {
      res.status(403).send('access denied');
    }


}

module.exports = { authenticateToken };
