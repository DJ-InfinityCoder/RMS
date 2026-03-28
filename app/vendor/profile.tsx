import { useState } from "react";
import { View, TextInput, Button } from "react-native";

export default function VendorProfile() {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/vendor/profile", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  };

  return (
    <View>
      <TextInput placeholder="Name" onChangeText={setName} />
      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
}