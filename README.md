# JungleOrbit – Team Binary Brains (ASTRA 2026)

A browser-based, offline-friendly interactive prototype for the JungleOrbit zero-network train–wildlife collision prevention concept.

## Run it in VS Code (beginner steps)

1. Download and extract `JungleOrbit-Website.zip`.
2. Open **Visual Studio Code**.
3. Select **File → Open Folder**.
4. Choose the extracted folder named `JungleOrbit-Website` (select the folder itself, not `index.html`).
5. In the Explorer on the left, open `index.html`.
6. Recommended: install the **Live Server** extension. Click the Extensions icon on the left, search for `Live Server` by Ritwick Dey, and install it.
7. Right-click `index.html` and select **Open with Live Server**. Your browser should open the JungleOrbit dashboard.
8. Click any of the five feature cards. Use **BACK TO DASHBOARD** to return.

### Without Live Server
You can double-click `index.html` in File Explorer to open it in a browser. Live Server is recommended while editing because it refreshes the page when you save changes.

## Folder structure

```text
JungleOrbit-Website/
├── index.html                 # All six screens and page structure
├── README.md                  # This setup guide
├── css/
│   └── style.css               # Dark neon theme, layout and responsive styling
├── js/
│   └── app.js                  # Navigation, calculations, animation and demo data
└── assets/
    └── references/             # Your six uploaded interface screenshots
```

## What works

- Five dashboard cards navigate to five feature screens.
- Feature 01: speed, load and obstacle-distance controls update a simplified stopping-distance model, clear margin, risk indicator and graph.
- Feature 02: move the wildlife distance slider or click **Simulate next approach** to move between clear, 2 km advisory and 800 m emergency states.
- Feature 03: animated dual waveforms; test broadcast plays a local browser-generated tone (requires a user click and audio-enabled browser).
- Feature 04: Cruise, Advisory and Emergency buttons update speed, gap, braking status and corridor status.
- Feature 05: add simulated telemetry packets and export the visible audit records as JSON.
- Responsive layout for desktop and smaller screens.

## Important prototype limitations

This is a front-end demonstration. It does **not** connect to live NavIC/ISRO messaging, railway hardware, real GPS, real animal collars, or a certified braking controller. The map, animal positions, packets, statistics, and compliance labels are simulated/demo data. The stopping-distance formula is an educational model and must not be used to control a real train. The Plan Bee audio button plays a simple local test tone, not a validated wildlife deterrent or a true 22.4 kHz acoustic array.

The screenshots are supplied in `assets/references/` so your team can compare the design while developing. The page recreates their dark technical visual language and layout in live HTML/CSS rather than using static screenshots as backgrounds.
