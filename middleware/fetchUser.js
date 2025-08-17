const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
    try {
        const token = req.header("authToken"); // or use Authorization header
        if (!token) {
            return res.status(401).json({ error: "Access denied, no token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Save decoded payload directly
        req.user = decoded; // contains userId, email, username
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = fetchUser;
