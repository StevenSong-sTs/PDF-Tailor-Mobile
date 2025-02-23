import { useState } from "react";
import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heart } from "lucide-react-native";

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Button
        size="lg"
        variant="solid"
        action="primary"
        onPress={() => setCount(count + 1)}
      >
        <Heart size={24} color="white" />
        <ButtonText>Hello World</ButtonText>
      </Button>

      <Text size="lg">Button clicked: {count} times</Text>
    </View>
  );
}
