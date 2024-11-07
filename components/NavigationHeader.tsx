import {
  MPLocation,
  MPLocationPropertyNames,
} from "@mapsindoors/react-native-maps-indoors-mapbox";
import { Button, Text, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import React from "react";
import { Entypo, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";

const BoldText = (props: React.PropsWithChildren) => (
  <Text style={{ fontWeight: "bold" }}>{props.children}</Text>
);

type NavigationHeaderProps = {
  searchResults: MPLocation[] | undefined;
  fromLocation: MPLocation | undefined;
  toLocation: MPLocation | undefined;
  getRoute: () => void;
  clearRoute: () => void;
  clear: () => void;
  centerItem: () => void;
  isRouteVisible: boolean;
};
export default function NavigationHeader({
  searchResults,
  fromLocation,
  toLocation,
  getRoute,
  clearRoute,
  clear,
  centerItem,
  isRouteVisible,
}: NavigationHeaderProps) {
  console.log(
    toLocation?.getProperty(MPLocationPropertyNames.name) +
      " toLocation" +
      JSON.stringify(toLocation, null, 2)
  );

  const iconSize = 24;
  return (
    
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "#FFA8",
          borderRadius: 8,
          marginVertical: 10,
          alignItems: "center",
          padding: 8,
          gap: 24,
         
          borderColor: Colors.dark,
          borderWidth: 1,
          display:
            fromLocation || toLocation || searchResults ? "flex" : "none",
        }}
      >
        <Text style={{ color: "black" }}>
          {toLocation?.getProperty(MPLocationPropertyNames.name)}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
        <MaterialCommunityIcons
          name="target"
          size={iconSize}
          color="black"
          onPress={centerItem}
        />

          {isRouteVisible ? (
            <FontAwesome6
              name="road-circle-xmark"
              size={iconSize}
              color="black"
              onPress={() => {
                clearRoute();
              }}
            />
          ) : (
            <FontAwesome6
              name="road"
              size={iconSize}
              color="black"
              onPress={() => {
                getRoute();
              }}
            />
          )}

          <Entypo
            name="circle-with-cross"
            size={iconSize}
            color="black"
            onPress={() => {
              clear();
            }}
          />
        </View>
      </View>
  );
}
