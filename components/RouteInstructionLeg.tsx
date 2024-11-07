import { MPRouteLeg } from "@mapsindoors/react-native-maps-indoors-mapbox";
import {Text, View} from "react-native";
import {BottomSheetFlatList} from "@gorhom/bottom-sheet";
import React from "react";
import {Colors} from "react-native/Libraries/NewAppScreen";


export default function RouteInstructionLeg({leg}: {leg: MPRouteLeg|undefined}) {
  return <View style={{ backgroundColor: Colors.light, padding: 5, height: '100%'}}>
    <Text style={{color: Colors.dark}}>Leg instructions</Text>
    <Text style={{color: Colors.dark}}>{`dist:${leg?.distance?.value} dur:${leg?.duration?.value}`}</Text>
    <BottomSheetFlatList data={leg?.steps} renderItem={ ({item: step}) =>
      <Text style={{color: Colors.dark}}>{step.htmlInstructions}</Text>
    }/>
  </View>
}