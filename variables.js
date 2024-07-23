import Constants from 'expo-constants';

const ENV = {
  dev: {
    auth_url: "http://192.168.12.242:8002",
    ringer_url: "http://192.168.12.242:8001",
    ringer_url_ws: "ws://192.168.12.242:8001"
  },
  prod: {
    auth_url: "https://api.auth.lifplatforms.com",
    ringer_url: "https://api.ringer.lifplatforms.com",
    ringer_url_ws: "wss://ws.api.ringer.lifplatforms.com"
  }
};

function getEnvVars(env = "") {
  if (env === null || env === undefined || env === "") return ENV.dev;
  if (env.indexOf("dev") !== -1) return ENV.dev;
  if (env.indexOf("prod") !== -1) return ENV.prod;
}

export default getEnvVars(Constants.expoConfig.releaseChannel);