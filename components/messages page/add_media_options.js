import { View, Text, Keyboard } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import styles from '../../styles/messages/addMediaOptions';
import { useEffect } from "react";

export function AddMediaOptions({ 
    showMediaOptions,
    rightPosition,
    handle_add_media,
    setShowGIFModal
}) {

    function handle_add_gif() {
        // Close add media options popup
        handle_add_media();

        // Dismiss keyboard
        Keyboard.dismiss();

        // Show GIF modal
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