import * as Location from "expo-location";

import {
  MPPoint,
  MPPositionProviderInterface,
  MPPositionResultInterface,
  OnPositionUpdateListener,
} from "@mapsindoors/react-native-maps-indoors-mapbox";

class ExpoPositionProvider implements MPPositionProviderInterface {
  positionUpdateListeners: OnPositionUpdateListener[] = [];

  name: string = "My Position Provider";

  latestPosition?: MPPositionResultInterface;

  timer?: NodeJS.Timeout;

  constructor() {
    this.updatePosition();
  }

  getLatestPosition(): MPPositionResultInterface | undefined {
    return this.latestPosition;
  }

  addOnPositionUpdateListener(listener: OnPositionUpdateListener) {
    this.positionUpdateListeners.push(listener);

    if (this.latestPosition) {
      listener(this.latestPosition);
    }
  }

  removeOnPositionUpdateListener(listener: OnPositionUpdateListener) {
    this.positionUpdateListeners.filter((item) => item !== listener);
  }

  async updatePosition() {
    const position = await Location.getCurrentPositionAsync({});

    this.latestPosition = {
      point: new MPPoint(position.coords.latitude, position.coords.longitude),
      positionProvider: this.name,
      floorIndex: 0,
    };

    this.positionUpdateListeners.forEach((listener) => {
      if (this.latestPosition) listener(this.latestPosition);
    });
  }

  start() {
    if (!this.timer) {
      this.timer = setInterval(() => this.updatePosition(), 5000);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export async function createPositionProvider(): Promise<ExpoPositionProvider | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log("Location permission status: " + status);
  if (status === "granted") {
    return new ExpoPositionProvider();
  }
  return null;
}
