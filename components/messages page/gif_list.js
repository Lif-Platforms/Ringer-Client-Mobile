import { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../../styles/messages/gif_list";

export default function GIFList({ search_query, gifToSend, setGifToSend }) {
    const [results, setResults] = useState();

    useEffect(() => {
        if (search_query.trim() !== "") {
            setResults("loading");
            setGifToSend({url: null, id: null});

            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/search_gifs?search=${search_query}`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Request failed with status code: " + response.status);
                }
            })
            .then((data) => {
                setResults(data.data);
            })
            .catch((error) => {
                console.log(error);
            })
        }
    }, [search_query]);

    // Handle GIF press
    function handleGifPress(url, id) {
        setGifToSend({url: url, id: id});
    }

    if (results === "loading") {
        return (
            <View>
                <Text style={styles.loading_text}>Searching...</Text>
            </View>
        )
    } else if (Array.isArray(results)) {
        if (results.length === 0) {
            return (
                <View>
                    <Text style={styles.loading_text}>No Results :(</Text>
                </View>
            )
        } else {
            return (
                <ScrollView style={styles.gif_scroll}>
                    <View style={styles.gif_list}>
                        {results.map((image) => (
                            <TouchableOpacity key={image.id} onPress={() => handleGifPress(image.images.original.url, image.id)}>
                                <Image
                                    source={{uri: image.images.original.url}}
                                    style={[
                                        styles.gif,
                                        gifToSend.id === image.id && styles.selected_gif
                                    ]}
                                />
                            </TouchableOpacity>
                        ))} 
                    </View>
                </ScrollView>
            )
        }
    }
}