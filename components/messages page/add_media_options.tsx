import {
    View,
    Text,
    Keyboard,
    TouchableOpacity,
    StyleSheet
} from "react-native";

type AddMediaOptionsProps = {
    showMediaOptions: boolean;
    rightPosition: number;
    handle_add_media: () => void;
    setShowGIFModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function AddMediaOptions({ 
    showMediaOptions,
    rightPosition,
    handle_add_media,
    setShowGIFModal
}: AddMediaOptionsProps) {

    function handle_add_gif() {
        handle_add_media();
        Keyboard.dismiss();
        setShowGIFModal(true);
    }

    if (showMediaOptions) {
        return (
            <View style={[styles.menu, {right: rightPosition}]}>
                <TouchableOpacity onPress={handle_add_gif}>
                    <Text style={styles.menu_option}>GIF</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    menu: {
        position: "absolute",
        backgroundColor: "#1C1C1C",
        borderColor: "#353535",
        borderWidth: 1,
        padding: 10,
        bottom: 55,
        borderRadius: 10,
        width: 120,
    },
    menu_option: {
        color: "white",
        textAlign: "center"
    }
});