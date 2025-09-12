import BottomNavBar from "@components/global/bottom_navbar"
import { Tabs } from "expo-router"

export default function AppLayout() {
    return (
        <>
            <Tabs screenOptions={{
                tabBarStyle: {
                    display: "none",
                },
                headerTintColor: "white",
                headerStyle: { 
                    height: 55,
                    backgroundColor: "#160900" ,
                    shadowColor: "transparent",
                },
            }}>
                <Tabs.Screen name="index" options={{ title: "" }} />
                <Tabs.Screen name="notifications" options={{ title: "" }} />
                <Tabs.Screen name="account" options={{ title: "" }} />
            </Tabs>
            <BottomNavBar />
        </>
    )
}