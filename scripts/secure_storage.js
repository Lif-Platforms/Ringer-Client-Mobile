import * as SecureStore from 'expo-secure-store';

export async function secureSave(key, value) {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error("Error saving to secure storage", error);
    }
}

export async function secureGet(key) {
    try {
        const value = await SecureStore.getItemAsync(key);
        return value;
    } catch (error) {
        console.error("Error retrieving from secure storage", error);
    }
}

export async function secureDelete(key) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error("Error deleting from secure storage", error);
    }
}