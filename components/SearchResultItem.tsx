import MapsIndoors, {MPLocation} from "@mapsindoors/react-native-maps-indoors-mapbox";
import React, {useEffect, useState} from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";

type SearchResultItemProps = {
  item: MPLocation;
  clickResult: (location: MPLocation) => void;
}

export default function SearchResultItem({item, clickResult}: SearchResultItemProps) {
  const fallbackImageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="

  const [itemURL, setItemURL] = useState(fallbackImageUrl)

  useEffect(() => {
    const _ = async () => {
      const url = await (await MapsIndoors.getDisplayRuleByLocation(item))?.getIconUrl()
      setItemURL(url ?? fallbackImageUrl);
    };
    _().then();
  }, [])

  return (
      <TouchableOpacity
          style={{paddingVertical: 5, width: '100%'}}
          onPress={(event) => clickResult(item)}>
        <View style={{backgroundColor: Colors.lighter, padding: 5, flexDirection: 'row'}}>
          <Image source={{uri: itemURL}} style={{width: 42, height:42}} />
          <View style={{flex: 1, paddingHorizontal: 10}}>
            <Text style={{fontSize: 20, color: Colors.dark}} numberOfLines={1}>{item.name}</Text>
            <Text style={{fontSize: 10, color: Colors.dark}} numberOfLines={1}>{item.buildingName}</Text>
          </View>
        </View>
      </TouchableOpacity>
  );
}