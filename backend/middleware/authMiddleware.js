import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Patient from '../models/Patient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'Admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'Patient') {
        req.user = await Patient.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.userRole = decoded.role;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.userRole === 'Admin') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Access denied. Administrator privileges required.' });
  }
};

export const patientOnly = (req, res, next) => {
  if (req.userRole === 'Patient') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Access denied. Patient access only.' });
  }
};
