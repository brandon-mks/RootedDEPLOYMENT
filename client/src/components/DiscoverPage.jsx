import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import DetailsDialog from "./DetailsDialog.jsx";
import { DynamicMap } from "./DynamicMap.jsx";
import { useMapContext } from "../mapContext/useMapContext.js";

//Filter Categories
// The temporary fixture key remains "restaurants", but the collection
// includes restaurants, cafés, and coffee shops.
const categories = [
  { value: "restaurant", label: "Food & Drink" },
  { value: "museum", label: "Museums" },
  { value: "hiking_area", label: "Hiking" },
  { value: "farmers_market", label: "Farmers markets" },
  { value: "live_music_venue", label: "Live music" },
];

function DiscoverPage() {
  const [places, setPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(["restaurant"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const { coords } = useMapContext();

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setError("");
      setPlaces([]);
      try {
        const response = await fetch("/api/places", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tags: selectedCategory,
            location: {
              latitude: coords.lat,
              longitude: coords.lng,
            },
          }),
        });
        const data = await response.json();
        setPlaces(data);
        //setTotalPages(data.totalPages);
      } catch (err) {
        if (err.message == "Failed to execute 'json' on 'Response': Unexpected end of JSON input") {
          setError(
            "Oops! No locations of the selected type exist within your current search area.",
          );
        }
        console.log(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [selectedCategory, coords]);

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content">
        <header className="discover-page-heading">
          <p className="hero-eyebrow">Discover your community</p>

          <h1>Find your next favorite spot.</h1>

          <p>Browse restaurants, museums, outdoor spaces, markets, and live music nearby.</p>
        </header>

        <Stack
          direction="row"
          spacing={1}
          className="discover-filters"
          sx={{
            marginBottom: 1.5,
            overflowX: "auto",
            paddingBottom: 0.5,
          }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <Button
                key={category.value}
                type="button"
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setPage(1);
                }}
                sx={{
                  flexShrink: 0,
                  borderColor: "var(--rooted-green)",
                  color: isSelected ? "white" : "var(--rooted-plum)",
                  backgroundColor: isSelected ? "var(--rooted-green)" : "transparent",
                  "&:hover": {
                    borderColor: "var(--rooted-green)",
                    backgroundColor: isSelected
                      ? "var(--rooted-dark-green)"
                      : "rgba(122, 166, 100, 0.1)",
                  },
                }}
              >
                {category.label}
              </Button>
            );
          })}
        </Stack>

        {loading && <CircularProgress aria-label="Loading places" />}

        {error && <Typography color="error">{error}</Typography>}

        <div className="placesView">
          <DynamicMap className="mainMap" places={places} />

          {!loading && !error && (
            <Box>
              <Box className="discover-results-grid">
                {places.map((place) => (
                  <Card
                    key={place.id}
                    sx={{
                      height: "100%",
                      maxHeight: "175px",
                    }}
                  >
                    <CardActionArea
                      onClick={() => setSelectedPlace(place)}
                      aria-label={`View details for ${place.displayName.text}`}
                      className="discover-card-action"
                    >
                      <CardContent>
                        <Typography variant="h6" component="h2">
                          {place.displayName.text}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                          {place.formattedAddress}
                        </Typography>

                        {place.rating != null && (
                          <Typography variant="body2" sx={{ marginTop: 1 }}>
                            Rating: {place.rating}
                          </Typography>
                        )}
                        <Typography
                          variant="button"
                          component="span"
                          className="discover-details-link"
                        >
                          View details
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>

              {totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_event, nextPage) => setPage(nextPage)}
                  shape="rounded"
                  variant="outlined"
                  className="rooted-pagination"
                />
              )}
            </Box>
          )}
        </div>
      </main>
      <DetailsDialog
        place={selectedPlace}
        places={places}
        onPlaceChange={setSelectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
      <Footer />
    </div>
  );
}

export default DiscoverPage;
