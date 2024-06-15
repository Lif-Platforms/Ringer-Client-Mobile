import Constants from 'expo-constants';

const ENV = {
  dev: {
    auth_url: "http://localhost:8002"
  },
  prod: {
    auth_url: "https://api.auth.lifplatforms.com"
  }
};

function getEnvVars(env = "") {
  if (env === null || env === undefined || env === "") return ENV.dev;
  if (env.indexOf("dev") !== -1) return ENV.dev;
  if (env.indexOf("prod") !== -1) return ENV.prod;
}

export default getEnvVars(Constants.expoConfig.releaseChannel);