import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import process from "process";

export const hashPassword = (password) => {
  return hash(password, 10);
};

export const comparePassword = (password, hash) => {
  return compare(password, hash);
};

export const createJWT = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.phone_number,
      is_admin: user.is_admin,
    },
    process.env.JWT_SECRET
  );

  return token;
};

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;
  // console.log("Bearer = " + bearer);
  if (!bearer) {
    res.status(401);
    res.json({ message: "not authorized" });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    console.log("Role Middleware");
    console.log(req.user);
    // Assuming req.user is set after authentication
    if (!req.user || req.user.is_admin !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
