import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        
        req.userId = decoded.userId;
        next();
    });
};
export default verifyToken