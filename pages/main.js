import { View, Text, Button } from "react-native";

export function MainScreen({ navigation }) {
    return(
        <View>
            <Text>Main Screen</Text>
            <Button
            title="Login Page"
            onPress={() =>
                navigation.navigate('Login')
            }
            />
        </View>
    )
}