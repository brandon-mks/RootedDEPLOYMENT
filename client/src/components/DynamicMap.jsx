import {
  AdvancedMarker,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  MapControl,
  ControlPosition,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { useMapContext } from "../mapContext/useMapContext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { IconButton, Tooltip, Button } from "@mui/material";
import { PlaceMarker } from "./PlaceMarker";

export const DynamicMap = ({ places }) => {
  //contexts
  const { coords, setCoords, userLocation, setLocation } = useMapContext();

  //internal states
  const [markers, setMarkers] = useState([]);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [mainMarkerShown, setMainMarkerShown] = useState(true);

  const map = useMap();

  //react watches for coords state change and pans to
  //new coords when it changes
  //note this only changes the map camera view
  //it does not reset the coords itself
  useEffect(() => {
    if (!map) return;
    map.panTo(coords);
  }, [map, coords]);

  useEffect(() => {
    setMarkers(places);
  }, [places]);

  // const handleClick = useCallback((ev) =>
  // <ChangeCenterMarker ev={ev} />)

  const recenter = () => {
    map.panTo(coords);
    map.setZoom(15);
    setMainMarkerShown(true);
  };

  const redoSearch = () => {
    const newCenter = map.getCenter();
    const newLat = newCenter.lat();
    const newLng = newCenter.lng();

    //lng return from getCenter() must be normalized
    const wrapLng = (lng) => {
      return ((((lng + 180) % 360) + 360) % 360) - 180;
    };

    const normalizedCoords = {
      lat: newLat,
      lng: wrapLng(newLng),
    };
    setCoords(normalizedCoords);
  };

  const resetUserLocation = () => {
    if (userLocation.exists) {
      map.panTo(userLocation.location);
      map.setZoom(15);
      setMainMarkerShown(true);
      setCoords(userLocation.location);
    } else {
      navigator.geolocation.getCurrentPosition(setLocation);
    }
  };

  //const handleMouseEnter = useCallback(() => setInfoWindowShown(true));
  //const handleClose = useCallback(() => setInfoWindowShown(false), []);
  return (
    <div className="dynamicMapContainer">
      <Map
        style={{ width: "100%", minWidth: "350px", height: "500px" }}
        defaultCenter={coords}
        defaultZoom={15}
        mapId={`8ddeff7eddcb919481a5064b`}
        gestureHandling="greedy"
        controlled={false}
        // onClick={handleClick}
        // onZoomChanged={handleZoomChange}
        disableDefaultUI
      >
        <MapControl className="mapRecenter" position={ControlPosition.INLINE_END_BLOCK_CENTER}>
          <Tooltip title="Click to re-center the map">
            <IconButton
              aria-label="recenter map"
              onClick={recenter}
              sx={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                bgcolor: "rgba(255, 255, 255, .7)",
                "&:hover": {
                  backgroundColor: `white`,
                },
              }}
            >
              <MyLocationIcon
                sx={{
                  fontSize: 50,
                }}
              ></MyLocationIcon>
            </IconButton>
          </Tooltip>
        </MapControl>

        <MapControl className="resetLocation" position={ControlPosition.INLINE_END_BLOCK_CENTER}>
          <Tooltip title="Go back to your current location">
            <IconButton
              aria-label="reset to user location"
              onClick={resetUserLocation}
              sx={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                bgcolor: "rgba(255, 255, 255, .7)",
                "&:hover": {
                  backgroundColor: `white`,
                },
              }}
            >
              <LocationOnIcon
                sx={{
                  fontSize: 23,
                }}
              ></LocationOnIcon>
            </IconButton>
          </Tooltip>
        </MapControl>

        <MapControl className="redoSearch" position={ControlPosition.BLOCK_START_INLINE_CENTER}>
          <Tooltip title="redo your current search with the current map area">
            <Button
              className="redoSearchButton"
              aria-label="set new map center"
              variant="outlined"
              color="--rooted-dark-green"
              onClick={redoSearch}
              sx={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                bgcolor: "rgba(255, 255, 255, .8)",
                "&:hover": {
                  backgroundColor: `var(--rooted-green)`,
                  color: `white`,
                  borderColor: `var(--rooted-green)`,
                },
                marginTop: ".5rem",
              }}
            >
              Redo Search Area Here
            </Button>
          </Tooltip>
        </MapControl>
        {/* marker/pin @ user location/coords lat/lng */}
        {mainMarkerShown ? (
          <AdvancedMarker
            position={coords}
            title={"Current Center of the map"}
            ref={markerRef}
            onMouseEnter={() => setInfoWindowShown(true)}
          >
            <Pin
              background={"#077187"}
              borderColor={"#074F57"}
              glyphColor={"#00E8FC"}
              scale={Number(1.3)}
            />

            {infoWindowShown ? (
              <InfoWindow
                className="changeCenterInfoWindow"
                anchor={marker}
                onClose={() => setInfoWindowShown(false)}
              >
                <h2>Map Center</h2>
                <p>This is the current center of the map!</p>
                <a onClick={() => setMainMarkerShown(false)}>
                  Click to get rid of this marker for now
                </a>
                <br />
              </InfoWindow>
            ) : null}
          </AdvancedMarker>
        ) : null}

        {/* only add custom map markers if they exist */}
        {markers.length
          ? markers.map((placeMarker) => (
              <PlaceMarker key={placeMarker.id} placeMarker={placeMarker} />
            ))
          : null}
      </Map>
    </div>
  );
};
