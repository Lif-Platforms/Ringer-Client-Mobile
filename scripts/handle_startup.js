import * as SecureStore from 'expo-secure-store';

/**
 * Handle App Startup.
 * 
 * @returns - Action that should be performed at startup.
 */
export default async function handle_startup() {
    /**
     * Get Value From Secure Storage.
     * 
     * @param {string} key - The item being accessed from secure storage.
     * @returns - Result from storage.
     */
    async function getValueFor(key) {
      let result = await SecureStore.getItemAsync(key);
      if (result) {
          return result;
      } else {
          return null;
      }
    }
    
    /**
     * Get Auth Credentials
     * 
     * @returns - Username and token.
     */
    async function get_credentials() {
        const username = await getValueFor("username");
        const token = await getValueFor("token");

        return {username: username, token: token};
    }


    // Get auth credentials
    const credentials = await get_credentials();

    // Create request form data
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("token", credentials.token);

    // Make auth request
    try {
        const auth_request = await fetch(`${process.env.EXPO_PUBLIC_AUTH_SERVER_URL}/auth/verify_token`, {
            method: "POST",
            body: formData
        })

        // Check response of auth request
        if (auth_request.status === 200) {
            return "auth_ok";
        } else {
            throw new Error("Request Failed! Status code: " + auth_request.status);
        }
    } catch (err) {
        if (err.message === 'Network request failed') {
            return "no_internet";
        } else {
            console.log(err);
            return "return_login";
        }
    }
}