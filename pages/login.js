import { View, Text, Button } from "react-native";

export function LoginScreen({ navigation }) {
    return(
        <View>
            <Text>Login Screen</Text>
            <Button
            title="Main Page"
            onPress={() =>
                navigation.navigate('Main')
            }
            />
        </View>
    )
}