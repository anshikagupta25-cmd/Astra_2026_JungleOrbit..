/* ==========================================================
   JUNGLEORBIT: PRODUCTION MULTI-DOMAIN ENGINE (script.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------
    // 1. MULTI-TAB CONTROLLER
    // ------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = `pane-${btn.getAttribute('data-tab')}`;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');

            // Force map recalculation when switching back to Cockpit
            if (btn.getAttribute('data-tab') === 'cockpit') {
                setTimeout(() => { map.invalidateSize(); }, 200);
            }
        });
    });

    // ------------------------------------------------------
    // 2. CORRIDOR DATABASE & MULTI-LAYER MAP
    // ------------------------------------------------------
    const CORRIDORS = {
        dooars: {
            name: "Dooars Reserve Corridor (WB)",
            center: [26.75, 88.90],
            zoom: 13,
            track: [
                [26.72, 88.84],
                [26.735, 88.87],
                [26.75, 88.90],
                [26.765, 88.93],
                [26.78, 88.96]
            ],
            trainStart: [26.735, 88.87],
            herdCoord: [26.755, 88.91],
            herdName: "Asian Elephant (Herd #04 Matriarch)"
        },
        rajaji: {
            name: "Rajaji National Park Sector (UK)",
            center: [30.05, 78.18],
            zoom: 13,
            track: [
                [30.01, 78.14],
                [30.03, 78.16],
                [30.05, 78.18],
                [30.07, 78.20],
                [30.09, 78.22]
            ],
            trainStart: [30.03, 78.16],
            herdCoord: [30.055, 78.185],
            herdName: "Elephant & Tiger Corridor Pass (T-28)"
        },
        assam: {
            name: "Deepor Beel Elephant Pass (Assam)",
            center: [26.12, 91.65],
            zoom: 13,
            track: [
                [26.09, 91.61],
                [26.11, 91.63],
                [26.12, 91.65],
                [26.14, 91.67],
                [26.16, 91.69]
            ],
            trainStart: [26.11, 91.63],
            herdCoord: [26.125, 91.655],
            herdName: "Rhinoceros & Asian Elephant Herd"
        }
    };

    let activeCorridor = CORRIDORS.dooars;

    // MAP INITIALIZATION
    const map = L.map('mainMap', { zoomControl: false }).setView(activeCorridor.center, activeCorridor.zoom);

    // Map Tile Layers
    const MAP_LAYERS = {
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
        topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 })
    };
    let currentTileLayer = MAP_LAYERS.dark;
    currentTileLayer.addTo(map);

    // Track Polyline
    let trackPolyline = L.polyline(activeCorridor.track, {
        color: '#94a3b8',
        weight: 4,
        dashArray: '6, 8'
    }).addTo(map);

    // Train Marker
    const trainIcon = L.divIcon({
        html: '<div style="font-size: 26px; transform: translate(-10px, -15px); filter: drop-shadow(0 0 10px #00f2fe);">🚂</div>',
        className: 'marker-train'
    });
    let trainMarker = L.marker(activeCorridor.trainStart, { icon: trainIcon }).addTo(map);

    // Wildlife Herd Marker
    const animalIcon = L.divIcon({
        html: '<div style="font-size: 28px; transform: translate(-12px, -16px); filter: drop-shadow(0 0 10px #f59e0b);">🐘</div>',
        className: 'marker-animal'
    });
    let herdMarker = L.marker(activeCorridor.herdCoord, { icon: animalIcon }).addTo(map);

    // Geofence Rings
    let yellowRing = L.circle(activeCorridor.herdCoord, {
        color: '#f59e0b',
        dashArray: '6, 6',
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
        radius: 2000
    }).addTo(map);

    let redRing = L.circle(activeCorridor.herdCoord, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.18,
        radius: 800
    }).addTo(map);

    // ------------------------------------------------------
    // 3. CORRIDOR & LAYER SWITCHERS
    // ------------------------------------------------------
    document.getElementById('mapLayerSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        map.removeLayer(currentTileLayer);
        currentTileLayer = MAP_LAYERS[val] || MAP_LAYERS.dark;
        currentTileLayer.addTo(map);
    });

    document.getElementById('corridorSelect').addEventListener('change', (e) => {
        const selected = CORRIDORS[e.target.value];
        if (!selected) return;
        activeCorridor = selected;

        map.setView(activeCorridor.center, activeCorridor.zoom);
        
        map.removeLayer(trackPolyline);
        trackPolyline = L.polyline(activeCorridor.track, {
            color: '#94a3b8',
            weight: 4,
            dashArray: '6, 8'
        }).addTo(map);

        trainMarker.setLatLng(activeCorridor.trainStart);
        herdMarker.setLatLng(activeCorridor.herdCoord);
        yellowRing.setLatLng(activeCorridor.herdCoord);
        redRing.setLatLng(activeCorridor.herdCoord);

        addAuditLog(`Corridor switched to: ${activeCorridor.name}`, "ROUTING");
        updateTelemetry(2.5);
    });

    // ------------------------------------------------------
    // 4. INTERACTIVE CLICK-TO-MOVE HERD
    // ------------------------------------------------------
    let spawnMode = false;
    const btnSpawn = document.getElementById('btnSpawnAnimal');

    btnSpawn.addEventListener('click', () => {
        spawnMode = !spawnMode;
        if (spawnMode) {
            btnSpawn.classList.add('active');
            btnSpawn.textContent = "🎯 Click Map to Place";
        } else {
            btnSpawn.classList.remove('active');
            btnSpawn.textContent = "📍 Move Herd by Click";
        }
    });

    map.on('click', (e) => {
        if (!spawnMode) return;
        const newPos = [e.latlng.lat, e.latlng.lng];
        herdMarker.setLatLng(newPos);
        yellowRing.setLatLng(newPos);
        redRing.setLatLng(newPos);

        // Calculate direct distance from train to new herd point (in km using Haversine)
        const trainPos = trainMarker.getLatLng();
        const distKm = getDistanceFromLatLonInKm(trainPos.lat, trainPos.lng, newPos[0], newPos[1]);
        
        spawnMode = false;
        btnSpawn.classList.remove('active');
        btnSpawn.textContent = "📍 Move Herd by Click";

        document.getElementById('hudDistanceSlider').value = Math.min(Math.max(distKm, 0.1), 3.5);
        updateTelemetry(distKm);
        addAuditLog(`Wildlife herd relocated to [${newPos[0].toFixed(3)}, ${newPos[1].toFixed(3)}]. Distance: ${distKm.toFixed(2)} km`, "GEOFENCE_UPDATE");
    });

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    function deg2rad(deg) { return deg * (Math.PI/180); }

    // ------------------------------------------------------
    // 5. REAL PLAN BEE AUDIO SYNTHESIS & SPEECH
    // ------------------------------------------------------
    let audioCtx = null;
    let beeOscillator = null;
    let beeGain = null;

    function startPlanBeeAudio() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (beeOscillator) return; // already playing

            beeOscillator = audioCtx.createOscillator();
            beeGain = audioCtx.createGain();

            // Modulate saw-tooth wave to mimic frequency of 10,000 angry honeybees (~200Hz - 450Hz)
            beeOscillator.type = 'sawtooth';
            beeOscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
            beeOscillator.frequency.exponentialRampToValueAtTime(380, audioCtx.currentTime + 0.4);

            beeGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

            beeOscillator.connect(beeGain);
            beeGain.connect(audioCtx.destination);
            beeOscillator.start();
        } catch (e) {
            console.log("AudioContext blocked or unallowed", e);
        }
    }

    function stopPlanBeeAudio() {
        if (beeOscillator) {
            try {
                beeOscillator.stop();
                beeOscillator.disconnect();
            } catch (e) {}
            beeOscillator = null;
        }
    }

    function speakAlert(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.rate = 1.05;
            window.speechSynthesis.speak(msg);
        }
    }

    document.getElementById('btnAudioTest').addEventListener('click', () => {
        startPlanBeeAudio();
        speakAlert("JungleOrbit NavIC satellite link verified. Collision avoidance systems operational.");
        setTimeout(stopPlanBeeAudio, 2500);
    });

    // ------------------------------------------------------
    // 6. TELEMETRY & PHYSICS ENGINE (v² = u² - 2as)
    // ------------------------------------------------------
    const slider = document.getElementById('hudDistanceSlider');
    const badge = document.getElementById('hudDistanceBadge');
    const hudBanner = document.getElementById('hudBanner');
    const bannerIcon = document.getElementById('bannerIcon');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerSub = document.getElementById('bannerSub');
    const speedReadout = document.getElementById('speedReadout');
    const limitReadout = document.getElementById('limitReadout');
    const brakeDistVal = document.getElementById('brakeDistVal');
    const targetDistVal = document.getElementById('targetDistVal');
    const marginVal = document.getElementById('marginVal');
    const marginBar = document.getElementById('marginBar');
    const acousticCard = document.getElementById('acousticCard');
    const acousticStatus = document.getElementById('acousticStatus');
    const tab2Dist = document.getElementById('tab2Dist');
    const tab2Pill = document.getElementById('tab2Pill');

    let currentSafetyState = 'green';

    window.setProximity = function(val) {
        slider.value = val;
        updateTelemetry(val);
    };

    slider.addEventListener('input', (e) => {
        updateTelemetry(parseFloat(e.target.value));
    });

    function updateTelemetry(d) {
        const distMeters = d * 1000;
        targetDistVal.textContent = `${distMeters.toFixed(0)} meters`;
        if (tab2Dist) tab2Dist.textContent = `${d.toFixed(1)} km`;

        if (d > 2.0) {
            // STATE 1: SAFE GREEN
            badge.textContent = `${d.toFixed(1)} km (Safe Zone)`;
            hudBanner.className = 'hud-alert-banner';
            bannerIcon.textContent = '🟢';
            bannerTitle.textContent = 'ALL CLEAR // LINE SPEED PERMITTED';
            bannerSub.textContent = 'NavIC telemetry indicates no wildlife intrusion within 2.0 km. Safe for line speed.';

            speedReadout.textContent = '98';
            speedReadout.style.color = 'var(--cyan)';
            limitReadout.textContent = '100';

            brakeDistVal.textContent = '720 meters';
            const margin = distMeters - 720;
            marginVal.textContent = `+${margin.toFixed(0)} m [SAFE TO HALT]`;
            marginVal.style.color = 'var(--green)';
            marginBar.style.width = '84%';
            marginBar.style.background = 'linear-gradient(90deg, var(--green), var(--cyan))';

            acousticCard.classList.remove('acoustic-active');
            acousticStatus.textContent = 'Status: Standby (Inactive)';
            stopPlanBeeAudio();

            if (tab2Pill) { tab2Pill.className = 'status-pill green'; tab2Pill.textContent = 'SAFE ZONE'; }

            if (currentSafetyState !== 'green') {
                addAuditLog(`Wildlife cleared 2.0 km buffer. Normal line speed (100 km/h) restored.`, "COMPLIANT");
                currentSafetyState = 'green';
            }

        } else if (d > 0.8 && d <= 2.0) {
            // STATE 2: ADVISORY YELLOW
            badge.textContent = `${d.toFixed(1)} km (2 km Advisory)`;
            hudBanner.className = 'hud-alert-banner advisory';
            bannerIcon.textContent = '🟡';
            bannerTitle.textContent = 'ADVISORY // HERD PROXIMITY WARNING';
            bannerSub.textContent = `NavIC Packet: Herd within ${d.toFixed(1)} km. Throttle speed down to 60 km/h immediately.`;

            speedReadout.textContent = '58';
            speedReadout.style.color = 'var(--amber)';
            limitReadout.textContent = '60';

            brakeDistVal.textContent = '450 meters';
            const margin = distMeters - 450;
            marginVal.textContent = `+${margin.toFixed(0)} m [CAUTION BUFFER]`;
            marginVal.style.color = 'var(--amber)';
            marginBar.style.width = '55%';
            marginBar.style.background = 'var(--amber)';

            acousticCard.classList.remove('acoustic-active');
            acousticStatus.textContent = 'Status: Standby (Inactive)';
            stopPlanBeeAudio();

            if (tab2Pill) { tab2Pill.className = 'status-pill yellow'; tab2Pill.textContent = 'ADVISORY ZONE'; }

            if (currentSafetyState !== 'yellow') {
                speakAlert("Caution: Wildlife in corridor. Throttle speed to sixty kilometers per hour.");
                addAuditLog(`NavIC Advisory Packet received. Locomotive throttle clamped to 60 km/h.`, "ADVISORY");
                currentSafetyState = 'yellow';
            }

        } else {
            // STATE 3: CRITICAL RED EMERGENCY
            badge.textContent = `${d.toFixed(1)} km (CRITICAL INTRUSION)`;
            hudBanner.className = 'hud-alert-banner critical';
            bannerIcon.textContent = '🔴';
            bannerTitle.textContent = 'CRITICAL BRAKE // IMMINENT INTRUSION';
            bannerSub.textContent = 'HERD BREACHED 800M BUFFER. FULL SERVICE BRAKE ENGAGED. PLAN BEE ACTIVE.';

            speedReadout.textContent = '22';
            speedReadout.style.color = 'var(--red)';
            limitReadout.textContent = '25';

            brakeDistVal.textContent = '180 meters';
            const margin = distMeters - 180;
            marginVal.textContent = `+${margin.toFixed(0)} m [EMERGENCY DECEL]`;
            marginVal.style.color = 'var(--red)';
            marginBar.style.width = '24%';
            marginBar.style.background = 'var(--red)';

            acousticCard.classList.add('acoustic-active');
            acousticStatus.textContent = 'ACTIVE // Ultrasonic Bee Frequency Active';
            startPlanBeeAudio();

            if (tab2Pill) { tab2Pill.className = 'status-pill yellow'; tab2Pill.style.background = 'rgba(239,68,68,0.2)'; tab2Pill.style.color = '#f87171'; tab2Pill.textContent = 'CRITICAL ALERT'; }

            if (currentSafetyState !== 'red') {
                speakAlert("Emergency brake engaged. Elephant herd on track. Plan Bee acoustic deterrent active.");
                addAuditLog(`CRITICAL: Herd entered 800m emergency buffer. Automated brake clamped to 25 km/h. Plan Bee active.`, "EMERGENCY_BRAKE");
                currentSafetyState = 'red';
            }
        }

        // Push Raw NavIC Packet
        pushNavICPacket(d, currentSafetyState);
    }

    // ------------------------------------------------------
    // 7. RAW NAVIC PACKET STREAM GENERATOR
    // ------------------------------------------------------
    const packetStream = document.getElementById('packetStream');
    function pushNavICPacket(d, state) {
        if (!packetStream) return;
        const now = new Date().toTimeString().split(' ')[0];
        const stateCode = state === 'green' ? 'CLR_100' : (state === 'yellow' ? 'ADV_60' : 'CRIT_25');
        const hexChecksum = Math.floor(Math.random() * 89 + 10).toString(16).toUpperCase();
        const sentence = `!NMS,12423,D${(d * 1000).toFixed(0)},${stateCode}*${hexChecksum}`;

        const pLine = document.createElement('div');
        pLine.className = 'p-line';
        pLine.innerHTML = `<span class="p-time">${now}</span> <span class="p-hex">${sentence}</span>`;
        packetStream.prepend(pLine);

        // Keep last 10 packets
        while (packetStream.children.length > 10) {
            packetStream.removeChild(packetStream.lastChild);
        }
    }

    // ------------------------------------------------------
    // 8. MoEFCC AUDIT BLACKBOX & CSV EXPORT
    // ------------------------------------------------------
    const auditTableBody = document.getElementById('auditTableBody');
    const auditRecords = [
        { time: "22:14:02 IST", corridor: "Dooars KM-142.4", train: "Train #12423 Rajdhani", sat: "NavIC-1I (S-Band)", desc: "System initialization. Downlink lock verified.", speed: "98 km/h", status: "COMPLIANT" },
        { time: "22:14:45 IST", corridor: "Dooars KM-142.4", train: "Train #12423 Rajdhani", sat: "NavIC-1I (L5 NMS)", desc: "Wildlife herd collar #IRNSS-ELE-04 detected.", speed: "98 km/h", status: "MONITORED" }
    ];

    function addAuditLog(description, status) {
        const timeStr = new Date().toLocaleTimeString() + ' IST';
        const record = {
            time: timeStr,
            corridor: activeCorridor.name,
            train: "Train #12423 Rajdhani",
            sat: "NavIC-1I (L5 Downlink)",
            desc: description,
            speed: `${speedReadout.textContent} km/h`,
            status: status
        };
        auditRecords.unshift(record);

        const row = document.createElement('tr');
        const pillClass = status === 'COMPLIANT' || status === 'ROUTING' ? 'green' : (status === 'ADVISORY' ? 'yellow' : 'yellow');
        row.innerHTML = `
            <td>${record.time}</td>
            <td>${record.corridor}</td>
            <td>${record.train}</td>
            <td>${record.sat}</td>
            <td>${record.desc}</td>
            <td>${record.speed}</td>
            <td><span class="status-pill ${pillClass}">${record.status}</span></td>
        `;
        if (auditTableBody) auditTableBody.prepend(row);
    }

    // CSV Exporter
    document.getElementById('btnExportCSV').addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Timestamp,Corridor,Train ID,Satellite Source,Incident Description,Speed,Audit Status\n";
        
        auditRecords.forEach(r => {
            csvContent += `"${r.time}","${r.corridor}","${r.train}","${r.sat}","${r.desc}","${r.speed}","${r.status}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `JungleOrbit_MoEFCC_Audit_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.getElementById('btnClearAudit').addEventListener('click', () => {
        if (confirm("Clear local blackbox session history?")) {
            auditRecords.length = 0;
            if (auditTableBody) auditTableBody.innerHTML = '';
        }
    });

    // ------------------------------------------------------
    // 9. AUTOMATED TRAIN MOTION SIMULATION LOOP
    // ------------------------------------------------------
    let simActive = true;
    let trackIndex = 0;
    let progress = 0;
    const btnToggle = document.getElementById('btnToggleSim');
    const btnReset = document.getElementById('btnResetSim');

    btnToggle.addEventListener('click', () => {
        simActive = !simActive;
        btnToggle.textContent = simActive ? "⏸️ Pause Train" : "▶️ Resume Train";
        btnToggle.classList.toggle('active', simActive);
    });

    btnReset.addEventListener('click', () => {
        trackIndex = 0;
        progress = 0;
        trainMarker.setLatLng(activeCorridor.track[0]);
        updateTelemetry(3.0);
    });

    setInterval(() => {
        if (!simActive) return;
        const pts = activeCorridor.track;
        if (trackIndex >= pts.length - 1) {
            trackIndex = 0; // loop
        }

        progress += 0.04;
        if (progress >= 1.0) {
            progress = 0;
            trackIndex++;
            if (trackIndex >= pts.length - 1) trackIndex = 0;
        }

        const p1 = pts[trackIndex];
        const p2 = pts[trackIndex + 1];
        const curLat = p1[0] + (p2[0] - p1[0]) * progress;
        const curLng = p1[1] + (p2[1] - p1[1]) * progress;

        trainMarker.setLatLng([curLat, curLng]);
    }, 400);

    // Live Header Clock
    setInterval(() => {
        const timeStr = new Date().toLocaleTimeString() + ' IST';
        const clk = document.getElementById('globalClock');
        if (clk) clk.textContent = timeStr;
    }, 1000);

    // Initial run
    updateTelemetry(2.5);
});
