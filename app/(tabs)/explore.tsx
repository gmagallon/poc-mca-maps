import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapsIndoors, {
  MapControl,
  MapView,
  MPCameraUpdate,
  MPDirectionsRenderer,
  MPDirectionsService,
  MPFilter,
  MPGeometry,
  MPLocation,
  MPMapConfig,
  MPPositionResultInterface,
  MPQuery,
  MPRoute,
  MPSelectionBehavior,
  MPVenue,
} from "@mapsindoors/react-native-maps-indoors-mapbox";
import { NativeEventEmitter, useWindowDimensions, View } from "react-native";
import SearchBox from "../../components/SearchBox";
import BottomSheet from "@gorhom/bottom-sheet";
import NavigationHeader from "../../components/NavigationHeader";
import SearchResults from "../../components/SearchResults";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { createPositionProvider } from "../../helpers/ExpoPositionProvider";

export default function MapScreen() {
  const [mapControl, setMapControl] = useState<MapControl>();

  const load = async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_RESORT_API_KEY ?? "?";

      console.log("Loading MapsIndoors... " + apiKey);
      await MapsIndoors.load(apiKey);

      console.log("Creating MapControl...");
      const mapControl = await MapControl.create(
        new MPMapConfig({
          useDefaultMapsIndoorsStyle: true,
          showUserPosition: true,
        }),
        NativeEventEmitter
      );
      setMapControl(mapControl);

      mapControl.setOnLocationSelectedListener((location) => {
        console.log("Location selected: " + JSON.stringify(location, null, 2));
        if (!location?.id) return;
        setToLocation(location);
        clearRoute();
      });

      const positionProvider = await createPositionProvider();
      if (positionProvider) {
        MapsIndoors.setPositionProvider(positionProvider);

        positionProvider.addOnPositionUpdateListener(
          ({ point }: MPPositionResultInterface) => {
            setFromLocation(
              MPLocation.create({
                id: "my-location",
                geometryType: MPGeometry.point,
                properties: {
                  name: "My location",
                  aliases: [],
                  fields: {},
                  categories: {
                    "My location": "My location",
                  },
                  floor: 0,
                  floorName: "",
                  building: "",
                  venue: "",
                  type: "My location",
                  description: "My location",
                  externalId: "",
                  activeFrom: null,
                  activeTo: null,
                  imageUrl: null,
                  locationType: "poi",
                  bookable: false,
                  anchor: point.toJSON(),
                },
                geometry: point.toJSON(),
              })
            );
          }
        );
      }

      console.log("Moving to venue...");
      await mapControl.goTo((await MapsIndoors.getVenues()).getAll()[0]);

      console.log("Done!");
    } catch (e) {
      console.error("Error while loading MapsIndoors:", e);
    }
  };

  const clear = () => {
    clearRoute();
    setToLocation(undefined);
    setSearchResults(undefined);
  };

  const clearRoute = () => {
    setMPRoute(undefined);
    directionsRenderer?.clear();
    setDirectionsRenderer(undefined);
  };

  const livedata = async () => {
    if (!mapControl) {
      console.warn("Must load MapsIndoors before enabling live data");
      return;
    }

    try {
      if(isLive) {
        setIsLive(false);
        await mapControl.disableLiveData("position");
      } else {
        setIsLive(true);
        await mapControl.enableLiveData("position");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error while enabling live data: " + e.message);
      } else {
        console.error("Error while enabling live data:", e);
      }
    }
    
  };

  const bottomSheet = useRef<BottomSheet>();

  const search = async (text: string | undefined) => {
    if (text === undefined) {
      console.debug("Cleaning search");
      setSearchResults(undefined);
      setToLocation(undefined);
      clearRoute();
      return;
    }

    console.debug(`Searching for "${text}"`);

    const query = MPQuery.create({ query: text });
    const filter = MPFilter.create();

    const locations = await MapsIndoors.getLocationsAsync(query, filter);

    setSearchResults(locations);
    (bottomSheet.current as BottomSheet).expand();
  };

  const [fromLocation, setFromLocation] = useState<MPLocation>();
  const [toLocation, setToLocation] = useState<MPLocation>();
  const [isLive, setIsLive] = useState(false);

  const clickResult = (result: MPLocation) => {
    console.debug(
      result.name,
      result.buildingName,
      result.id,
      result.bounds,
      result?.position
    );
    setToLocation(result);
    clearRoute();

    const selectionBehavior = MPSelectionBehavior.create({
      moveCamera: false,
      zoomToFit: false,
      showInfoWindow: false,
      animationDuration: 0,
      allowFloorChange: false,
    });
    mapControl?.selectLocation(result, selectionBehavior);

    mapControl?.goTo(result);

    (bottomSheet.current as BottomSheet).close();
  };

  const centerItem = () => {
    if (toLocation) {
      const selectionBehavior = MPSelectionBehavior.create({
        moveCamera: false,
        zoomToFit: false,
        showInfoWindow: false,
        animationDuration: 0,
        allowFloorChange: false,
      });
      mapControl?.selectLocation(toLocation, selectionBehavior);
      mapControl?.goTo(toLocation);
    }
  };

  const centerUser = () => {
    if(!isLive) {
      if (fromLocation) {
        const selectionBehavior = MPSelectionBehavior.create({
          moveCamera: false,
          zoomToFit: false,
          showInfoWindow: false,
          animationDuration: 0,
          allowFloorChange: false,
        });
        mapControl?.selectLocation(fromLocation, selectionBehavior);
        mapControl?.goTo(fromLocation);
      }
    } 

    livedata();
  };

  console.log("MapScreen " + !!fromLocation + " " + !!toLocation);

  const [searchResults, setSearchResults] = useState<MPLocation[] | undefined>(
    undefined
  );

  const [mproute, setMPRoute] = useState<MPRoute>();
  const [routeLeg, setRouteLeg] = useState<number>();
  const [directionsRenderer, setDirectionsRenderer] = useState<
    MPDirectionsRenderer | undefined
  >(undefined);

  const getRoute = async () => {
    if (!fromLocation || !toLocation) {
      return;
    }

    // Query route
    console.debug("Querying Route");

    //Creating the directions service, if it has not been created before.
    const directionsService = await MPDirectionsService.create();
    //Setting the travel mode to walking, to ensure instructions are for walking.
    await directionsService.setTravelMode("walking");

    let from = fromLocation.position;
    let to = toLocation.position;

    //Querying the route through the directionsService after
    const route = await directionsService.getRoute(from, to);
    console.debug({ route });
    setMPRoute(route);

    //Creating the directions renderer
    const directionsRenderer = new MPDirectionsRenderer(NativeEventEmitter);
    //Setting the route on the directions renderer, causing it to be rendered onto the map.
    await directionsRenderer.setRoute(route);

    setDirectionsRenderer(directionsRenderer);

    //Listen for leg changes
    directionsRenderer.setOnLegSelectedListener((leg) => {
      setRouteLeg(leg);
    });
  };

  // Load MapsIndoors when the app mounts, i.e. the MapView should be ready.
  useEffect(() => {
    load().catch((reason) => {
      console.error("MapsIndoors failed to load:", reason);
    });
  }, []); // NOTE: the second parameter deps: [] is important, otherwise it will load everytime the MapView changes

  useEffect(() => {
    if (!mproute && !searchResults) {
      console.debug("NO route or results");
      bottomSheet.current?.close();
      directionsRenderer?.clear();
    }
  }, [mproute, searchResults]);

  const { width, height } = useWindowDimensions();

  const iconSize = 32;

  const zoomPlus = useCallback(async () => {
    const pos = await mapControl?.getCurrentCameraPosition();
    if (!pos) return;
    const { zoom } = pos;

    await mapControl?.moveCamera(MPCameraUpdate.zoomTo(zoom + 1));
  }, [mapControl]);

  const zoomMinus = useCallback(async () => {
    const pos = await mapControl?.getCurrentCameraPosition();
    if (!pos) return;
    const { zoom } = pos;

    await mapControl?.moveCamera(MPCameraUpdate.zoomTo(zoom - 1.5));
  }, [mapControl]);

  const resetView = useCallback(async () => {
    directionsRenderer?.clear();
    const venue: MPVenue = (await MapsIndoors.getVenues()).getAll()[0];
    await mapControl?.goTo(venue);
  }, [mapControl, directionsRenderer]);

  const openSearch = useCallback(async () => {
    bottomSheet.current?.expand();
  }, []);

  const [bottomSheetPosition, setBottomSheetPosition] = useState(-1);

  return (
    <GestureHandlerRootView
      style={{ flex: 1, flexGrow: 1, position: "relative" }}
    >
      <View
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          zIndex: 100,
          gap: 8,
        }}
      >
        <AntDesign
          name="pluscircle"
          size={iconSize}
          color="black"
          onPress={zoomPlus}
        />
        <AntDesign
          name="minuscircle"
          size={iconSize}
          color="black"
          onPress={zoomMinus}
        />
        <MaterialIcons
          name="refresh"
          size={iconSize}
          color="black"
          onPress={resetView}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: 50,
          right: 10,
          zIndex: 100,
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome name="user-circle" size={iconSize} color={isLive ? "green" : "black" } onPress={centerUser} />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 90,
          right: 10,
          zIndex: 100,
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >  
        <MaterialCommunityIcons
          name="magnify"
          size={40}
          color="black"
          onPress={openSearch}
        />
      </View>

      <MapView
        style={{
          flex: 1,
        }}
      />

      {fromLocation && toLocation && bottomSheetPosition === -1 && (
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 10,
            zIndex: 100,
            gap: 8,
            width: width - 20,
          }}
        >
          <NavigationHeader
            searchResults={searchResults}
            fromLocation={fromLocation}
            toLocation={toLocation}
            getRoute={getRoute}
            clearRoute={clearRoute}
            clear={clear}
            centerItem={centerItem}
            isRouteVisible={!!mproute}
          />
        </View>
      )}

      <BottomSheet
        ref={bottomSheet}
        snapPoints={["20%", "60%"]}
        index={-1}
        enablePanDownToClose={true}
        onChange={setBottomSheetPosition}
      >
        <View style={{ paddingVertical: 8, paddingHorizontal: 16, gap: 8 }}>
          <SearchBox onSearch={search} onCancel={search} />
          <SearchResults
            searchResults={searchResults}
            clickResult={clickResult}
          />
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
