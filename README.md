# Pune Metro Tracker

A build-free GitHub Pages site covering the Purple and Aqua corridors. The station list is schematic. Demo mode shows simulated segments. Live mode displays timestamped vehicle coordinates with map links when a feed is configured.

## Preview

Run `python3 -m http.server 8000 --directory docs` from the repository root and open http://localhost:8000.

## Publish on GitHub Pages

1. Create a public GitHub repository and upload the contents of this project, including the `docs` folder and its hidden `.nojekyll` file.
2. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the default branch (usually `main`) and the `/docs` folder, then save. The Pages settings show the URL after deployment.

## Connect a live feed

Set `feedUrl` in `docs/config.mjs` to an authorized HTTPS endpoint serving JSON in this format:

```json
{"vehicles":[{"id":"example","line":"purple","latitude":18.53,"longitude":73.85,"timestamp":1794451200000}]}
```

Use UTC Unix milliseconds for the observation timestamp and map operator route IDs to `purple` or `aqua`. The browser fetches every 15 seconds and suppresses observations over 90 seconds old. A cross-origin endpoint must permit your Pages origin via CORS. If the operator supplies binary GTFS-Realtime or requires credentials, use a separately hosted adapter to decode the VehiclePositions feed, map route IDs (using static GTFS trip mappings if needed), and expose this JSON. Keep credentials server-side.

Station reference: https://www.punemetrorail.org/projectprofile.aspx?lang=en-US
