const {expressjwt} = require('express-jwt');

function authJwt() {
  const secret = process.env.SECRET;

  return expressjwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      {
        url: /\/public\/uploads(.*)/,
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: /\/api\/v1\/products(.*)/,
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: /\/api\/v1\/categories(.*)/,
        methods: ['GET', 'OPTIONS'],
      },
      //`${process.env.API_URL}/users/`,

      `${process.env.API_URL}/users/login`,
      `${process.env.API_URL}/users/register`,
    ],
  });
}

const isRevoked = async (req, token) => {
  if (token.payload.isAdmin) {
    return false;
  }
  return true;
};

module.exports = authJwt;
