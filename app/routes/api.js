const User = require('../models/user');
const config = require('../../config');
const secretKey = config.secretKey;
const jsonwebtoken = require('jsonwebtoken');

// CREATE USER TOKEN
function createUserToken(user) {
  const token = jsonwebtoken.sign({

    id: user._id,
    email: user.email,
    mobile: user.mobile,
    name: user.name,

  }, secretKey, {
    expiresIn: 900000000,
  });

  return token;
}


module.exports = function (app, express, io) {
  const api = express.Router();


  api.post('/signup', (req, res) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
    });

    user.save((err, user) => {
      if (err) {
        return console.log(err);
      }
      const token = createUserToken(user);
      res.json({
        success: true,
        token,
      });
    });
  });


  api.post('/login', (req, res) => {
    User.findOne({
      email: req.body.email,
    }).select('name email mobile password').exec((err, user) => {
      if (err) throw err;

      else if (!user) {
        res.send({ message: "User doesn't exist" });
      } else if (user) {
        const validPassword = user.comparePassword(req.body.password);

        if (!validPassword) {
          res.send({ message: 'Invalid Password' });
        } else {
          const token = createUserToken(user);

          res.json({
            success: true,
            message: 'Successfully login',
            token,
          });
        }
      }
    });
  });


    // Middleware
  api.use((req, res, next) => {
    const token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {
      jsonwebtoken.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(403).send({ success: false, message: 'Failed to connect' });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(403).send({ success: false, message: 'false token' });
    }
  });

  api.get('/me', (req, res) => {
    res.json(req.decoded);
  });


  return api;
};
