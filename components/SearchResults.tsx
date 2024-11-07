import {MPLocation} from "@mapsindoors/react-native-maps-indoors-mapbox";
import React from "react";
import SearchResultItem from './SearchResultItem';
import {BottomSheetFlatList} from "@gorhom/bottom-sheet";

type SearchResultsProps = {
  searchResults: MPLocation[] | undefined;
  clickResult: (location: MPLocation) => void;
}

export default function SearchResults({searchResults, clickResult}: SearchResultsProps) {

  return (
      <BottomSheetFlatList data={searchResults} keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => <SearchResultItem item={item} clickResult={clickResult} />}
      />
  )
}