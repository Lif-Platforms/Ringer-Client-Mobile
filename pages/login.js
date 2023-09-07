import { View, Text, Button } from "react-native";

export function LoginScreen({ navigation }) {

    // Handle navigation to main page
    function handle_navigation() {
        navigation.reset({index: 0, routes: [{name: 'Main'}]});
    }

    return(
        <View>
            <Text>Login Screen</Text>
            <Button
            title="Main Page"
            onPress={() =>
                handle_navigation()
            }
            />
        </View>
    )
}