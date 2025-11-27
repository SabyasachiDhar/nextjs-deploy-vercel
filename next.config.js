const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      env: {
        mongodb_username: encodeURIComponent("dharsabyasachivi_db_user"),
        mongodb_password: encodeURIComponent("ey2H6HdN5bHHZhA8"),
        mongodb_clustername: 'cluster0',
        mongodb_database: 'my-site-dev',
      },
    };
  }

  return {
    env: {
      mongodb_username: encodeURIComponent("dharsabyasachivi_db_user"),
      mongodb_password: encodeURIComponent("ey2H6HdN5bHHZhA8"),
      mongodb_clustername: 'cluster0',
      mongodb_database: 'my-site',
    },
  };
};
