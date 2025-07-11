import { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../../styles/messages/gif_list";
import { MasonryFlashList } from "@shopify/flash-list";
import RenderGIF from "./gif";

export default function GIFList({ search_query, gifToSend, setGifToSend }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (search_query.trim() !== "") {
            setLoading(true);
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
                let results_ = [];

                data.data.forEach(result => {
                    results_.push({
                        id: result.id,
                        url: result.images.original.url,
                        title: result.title,
                        dimensions: {
                            width: result.images.original.width,
                            height: result.images.original.height
                        }
                    })
                });

                setResults(results_);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                setResults([]);
                console.log(error);
            })
        }
    }, [search_query]);

    // Handle GIF press
    function handleGifPress(url, id, title) {
        setGifToSend({url: url, id: id, title: title});
    }

    // Return nothing if there is no search query
    if (search_query.trim() === "") { return null; }

    if (loading) {
        return (
            <View>
                <Text style={styles.loading_text}>Searching...</Text>
            </View>
        )
    }

    if (Array.isArray(results)) {
        if (results.length === 0) {
            return (
                <View>
                    <Text style={styles.loading_text}>No Results :(</Text>
                </View>
            )
        } else {
            return (
                <MasonryFlashList
                    data={results}
                    numColumns={2}
                    estimatedItemSize={100}
                    extraData={gifToSend}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RenderGIF
                            gifURL={item.url}
                            gifID={item.id}
                            gifDimensions={item.dimensions}
                            gifTitle={item.title}
                            handleGifPress={handleGifPress}
                            selected={gifToSend.id === item.id}
                        />
                    )}
                    contentContainerStyle={{
                        paddingBottom: 55
                    }}
                />
            )
        }
    }
}