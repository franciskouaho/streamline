import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {Tabs} from "expo-router";

const TabsLayout = () => {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#ff7a5c",
                tabBarInactiveTintColor: "#888",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    height: 70,
                    paddingBottom: 10,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 5,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "Calendar",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="new-task"
                options={{
                    title: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="add"
                            size={24}
                            color="#fff"
                            style={{
                                backgroundColor: "#ff7a5c",
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                textAlign: "center",
                                lineHeight: 50,
                                bottom: 10,
                                shadowColor: "#ff7a5c",
                                shadowOffset: {
                                    width: 0,
                                    height: 5,
                                },
                                shadowOpacity: 0.3,
                                shadowRadius: 5,
                                elevation: 5,
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="docs"
                options={{
                    title: "Documents",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

export default TabsLayout;