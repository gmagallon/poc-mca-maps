module.exports = {
  expo: {
    name: "mca-maps",
    slug: "mca-maps",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gmagallon.mcamaps",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "14.0",
          },
        },
      ],
      [
        "@mapsindoors/react-native-maps-indoors-mapbox/app.plugin.js",
        {
          publicToken: process.env.MAPBOX_PUBLIC_TOKEN,
          downloadToken: process.env.MAPBOX_PRIVATE_TOKEN,
          staticPods: true,
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "20a1ec89-b9f5-4ba3-adcb-2b3d7fc06e1d",
      },
    },
    owner: "gmagallon",
  },
};
