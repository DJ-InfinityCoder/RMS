import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function VendorHome() {
  const router = useRouter();

  return (
    <View>
      <Text>Vendor Dashboard</Text>
      <Button
        title="Update Profile"
        onPress={() => router.push("/vendor/profile")}
      />
    </View>
  );
}