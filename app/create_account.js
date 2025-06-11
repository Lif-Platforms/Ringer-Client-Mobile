import { WebView } from 'react-native-webview';
import { secureSave } from '@scripts/secure_storage';
import { useRouter } from 'expo-router';

export default function CreateAccountScreen() {
    const router = useRouter();

    async function handle_message(event) {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'create_account') {
            console.log(data);
            await secureSave('username', data.username);
            await secureSave('token', data.token);
            router.replace('/(app)/(tabs)/index');
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