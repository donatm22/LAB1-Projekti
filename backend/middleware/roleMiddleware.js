const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!req.user.roli || !roles.includes(req.user.roli)) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};

module.exports = allowRoles;