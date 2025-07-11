import { useEffect } from "react";
import React from "react";
import { Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const RenderGIF = React.memo(({
    gifURL,
    gifID,
    gifDimensions,
    gifTitle,
    handleGifPress,
    selected,
}) => {
    // Calculate the width of th column
    const columnWidth = Dimensions.get('window').width / 2 - 12;

    return (
        <TouchableOpacity
            style={styles.gif}
            onPress={() => handleGifPress(gifURL, gifID, gifTitle)}
        >
            <Image
                source={{uri: gifURL}}
                style={{
                    width: columnWidth,
                    height: (gifDimensions.height / gifDimensions.width) * columnWidth,
                    borderRadius: 10,
                    borderColor: "#ff9500",
                    borderWidth: selected ? 5 : 0
                }}
            />
        </TouchableOpacity>
    )
}, (prev, next) => prev.selected === next.selected)

export default RenderGIF;

const styles = StyleSheet.create({
    gif: {
        padding: 5
    }
})