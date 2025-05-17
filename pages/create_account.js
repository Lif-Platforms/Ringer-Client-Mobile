import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';

export default function CreateAccountScreen({ navigation }) {
    async function handle_message(event) {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'create_account') {
            console.log(data);
            await SecureStore.setItemAsync('username', data.username);
            await SecureStore.setItemAsync('token', data.token);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } 
    }

    return (
        <WebView
            source={{ uri: 'https://my.lifplatforms.com/create_account' }}
            userAgent='RingerMobileWebView'
            onMessage={handle_message}
        />
    );
}