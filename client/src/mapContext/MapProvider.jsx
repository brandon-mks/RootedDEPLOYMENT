import { useEffect, useState } from "react";
import { MapContext } from "./MapContext";

export function MapContextProvider({ children }) {
  const [coords, setCoords] = useState({ lat: 22.3193, lng: 114.1694 });
  const [userLocation, setUserLocation] = useState({
    exists: false,
    location: {
      lat: null,
      lng: null,
    },
  });

  const setLocation = (position) => {
    const userCoords = {
      lat: Number(position.coords.latitude),
      lng: Number(position.coords.longitude),
    };
    setCoords(userCoords);
    setUserLocation({
      exists: true,
      location: userCoords,
    });
  };

  //useEffect to get user location if browser supports it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  }, []);

  const value = { coords, setCoords, userLocation, setUserLocation, setLocation };
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
