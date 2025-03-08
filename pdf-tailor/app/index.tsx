import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FilePlus, Scissors, Combine, FileType } from "lucide-react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text size="2xl" bold>PDF Tailor</Text>
      
      <Link href="/split" asChild>
        <Button size="lg" variant="solid" action="primary">
          <Scissors size={24} color="white" />
          <ButtonText>Split PDF</ButtonText>
        </Button>
      </Link>

      <Link href="/merge" asChild>
        <Button size="lg" variant="solid" action="primary">
          <Combine size={24} color="white" />
          <ButtonText>Merge PDFs</ButtonText>
        </Button>
      </Link>

      <Link href="/scan" asChild>
        <Button size="lg" variant="solid" action="primary">
          <FileType size={24} color="white" />
          <ButtonText>Scan to PDF</ButtonText>
        </Button>
      </Link>
    </View>
  );
}
