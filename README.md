# NEPTON

NEPTON visualizes the project archive and active-fire detections on a Cesium globe.

## NASA FIRMS live feed

Set `VITE_FIRMS_MAP_KEY` in the ignored `.env.local` file to enable **Live feed · NASA FIRMS**. The client requests the NASA FIRMS area CSV endpoint for the selected region's bounding box, using the `VIIRS_SNPP_NRT` and `MODIS_NRT` sources and a two-day window. If either request fails, the app reports the error and displays the bundled archive instead.

`VITE_` variables are included in browser code and requests; for a production deployment, proxy FIRMS requests through a server-side endpoint if the map key must not be exposed.

Use **Archive · 2006–2026** to return to the bundled historical detections and timeline.

## Nepton AI chat

The dashboard includes the Nepton chat widget. The chat API runs server-side and reads `GROQ_API_KEY` from `Nace Project/.env`; copy `Nace Project/.env.example` there and set your own key. Do not use a `VITE_` prefix for this secret. Run `npm run dev` from the project root to start the dashboard and chat API together. Both the API and Vite proxy default to port `8787`; to use another port, set `GROQ_PROXY_PORT` in the shell before starting the app.
