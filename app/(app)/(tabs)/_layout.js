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
                <Tabs.Screen name="index" />
                <Tabs.Screen name="notifications" />
                <Tabs.Screen name="account" />
            </Tabs>
            <BottomNavBar />
        </>
    )
}