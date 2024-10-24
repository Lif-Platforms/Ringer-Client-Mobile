const ENV = {
  dev: {
    auth_url: "http://localhost:8002",
    ringer_url: "http://localhost:8001",
    ringer_url_ws: "ws://localhost:8001"
  },
  prod: {
    auth_url: "https://api.auth.lifplatforms.com",
    ringer_url: "https://api.ringer.lifplatforms.com",
    ringer_url_ws: "wss://ws.api.ringer.lifplatforms.com"
  }
};

function getEnvVars(env = __DEV__) {
  if (env) {
    console.log('detected dev env');
    return ENV.dev;
  } else {
    return ENV.prod;
  }
}

export default getEnvVars();