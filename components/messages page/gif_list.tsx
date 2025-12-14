import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import styles from "../../styles/messages/gif_list";
import { FlashList } from "@shopify/flash-list";
import RenderGIF from "./gif";
import { GIFToSend } from "../../types";

type GIFListProps = {
    search_query: string;
    gifToSend: GIFToSend | null;
    setGifToSend: React.Dispatch<React.SetStateAction<GIFToSend | null>>;
}

type SearchResultsType = {
    id: string;
    url: string;
    title: string;
    dimensions: {
        width: number;
        height: number;
    };
}

type RequestDataType = {
    id: string;
    title: string;
    images: {
        original: {
            url: string;
            width: number;
            height: number;
        }
    }
}

export default function GIFList({
    search_query,
    gifToSend,
    setGifToSend
}: GIFListProps) {
    const [results, setResults] = useState<SearchResultsType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (search_query.trim() !== "") {
            setLoading(true);
            setGifToSend(null);

            fetch(`${process.env.EXPO_PUBLIC_RINGER_SERVER_URL}/search_gifs?search=${search_query}`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Request failed with status code: " + response.status);
                }
            })
            .then((data) => {
                let searchResults: SearchResultsType[] = [];

                data.data.forEach((result: RequestDataType) => {
                    searchResults.push({
                        id: result.id,
                        url: result.images.original.url,
                        title: result.title,
                        dimensions: {
                            width: result.images.original.width,
                            height: result.images.original.height
                        }
                    })
                });

                setResults(searchResults);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                setResults([]);
                console.log(error);
            })
        }
    }, [search_query]);

    function handleGifPress(url: string, id: string, title: string) {
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
                <FlashList
                    data={results}
                    numColumns={2}
                    extraData={gifToSend}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RenderGIF
                            gifURL={item.url}
                            gifID={item.id}
                            gifDimensions={item.dimensions}
                            gifTitle={item.title}
                            handleGifPress={handleGifPress}
                            selected={gifToSend ? item.id : null}
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