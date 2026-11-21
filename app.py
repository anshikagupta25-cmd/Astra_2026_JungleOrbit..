"""
JUNGLEORBIT: Where Space Meets the Wild
Zero-Network Train–Wildlife Collision Prevention System
ASTRA 2026 · VIT Bhopal University · Team Binary Brains
"""

import streamlit as st
import math
from datetime import datetime
import time

# Set Streamlit Page Config
st.set_page_config(
    page_title="JungleOrbit // NavIC Space-Rail Telemetry",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Dark Theme Styling matching PPT Starry Space Design
st.markdown("""
<style>
    /* Dark Sci-Fi Theme */
    .stApp {
        background: radial-gradient(circle at 50% 10%, #151a30 0%, #060913 100%);
        color: #f8fafc;
    }
    
    .main-title {
        font-size: 42px;
        font-weight: 900;
        letter-spacing: 2px;
        background: linear-gradient(90deg, #ffffff, #a5b4fc, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0px;
    }
    
    .sub-tagline {
        color: #94a3b8;
        font-size: 16px;
        letter-spacing: 1px;
        margin-bottom: 20px;
    }
    
    .metric-card {
        background: rgba(18, 24, 46, 0.7);
        border: 1px solid rgba(147, 163, 233, 0.2);
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 12px;
    }
    
    .status-safe {
        background: rgba(16, 185, 129, 0.15);
        border-left: 5px solid #10b981;
        padding: 14px;
        border-radius: 6px;
        color: #a7f3d0;
    }
    
    .status-warning {
        background: rgba(245, 158, 11, 0.15);
        border-left: 5px solid #f59e0b;
        padding: 14px;
        border-radius: 6px;
        color: #fde68a;
    }
    
    .status-critical {
        background: rgba(239, 68, 68, 0.2);
        border-left: 5px solid #ef4444;
        padding: 14px;
        border-radius: 6px;
        color: #fecaca;
        animation: pulse 1.5s infinite;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# SIDEBAR: SYSTEM CONTROLS & HACKATHON CREDENTIALS
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🛰️ **JUNGLEORBIT CONTROLLER**")
    st.caption("ASTRA 2026 · VIT BHOPAL UNIVERSITY")
    st.markdown("---")
    
    st.markdown("#### 🎮 **Telemetry Simulation**")
    dist_km = st.slider(
        "Simulate Animal Distance to Track (km):",
        min_value=0.1,
        max_value=3.0,
        value=2.5,
        step=0.1,
        help="Drag slider to test 2km Advisory and 800m Emergency geofence breaches"
    )
    
    train_mass_tonnes = st.number_input("Locomotive Mass (Tonnes)", value=1500, step=100)
    
    st.markdown("---")
    st.markdown("#### 👥 **Team Binary Brains**")
    st.markdown("""
    * **01** Aditi Jain
    * **02** Anshika Gupta
    * **03** Samriddhi Jha
    * **04** Anushka Rajbhar
    """)
    st.caption("1st Year Engineering · Space Theme")

# -------------------------------------------------------------
# CORE PHYSICS ENGINE (v² = u² - 2as)
# -------------------------------------------------------------
dist_meters = dist_km * 1000

# Base cruising speed
if dist_km > 2.0:
    target_speed = 100
    current_speed = 98
    zone = "SAFE"
    status_icon = "🟢"
elif 0.8 < dist_km <= 2.0:
    target_speed = 60
    current_speed = 58
    zone = "ADVISORY"
    status_icon = "🟡"
else:
    target_speed = 25
    current_speed = 22
    zone = "CRITICAL"
    status_icon = "🔴"

# Stopping distance formula: s = v^2 / (2 * a)
# Assuming service brake deceleration a = 0.5 m/s^2 for a 1,500-tonne train
u_ms = current_speed * (1000 / 3600)  # convert km/h to m/s
decel_rate = 0.55  # m/s^2
stopping_dist_req = (u_ms ** 2) / (2 * decel_rate)
margin = dist_meters - stopping_dist_req

# -------------------------------------------------------------
# HEADER SECTION
# -------------------------------------------------------------
col_header, col_badges = st.columns([2, 1])

with col_header:
    st.markdown('<div class="main-title">JUNGLEORBIT</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-tagline">Where space meets the wild // Zero-Network Train–Wildlife Collision Prevention</div>', unsafe_allow_html=True)

with col_badges:
    st.markdown(f"""
    **NavIC-1I (S-Band / L5):** `LOCKED 100%`  
    **Locomotive ID:** `Train #12423 Rajdhani`  
    **Track Sector:** `KM-142.4 Dooars Forest Corridor`  
    **Timestamp:** `{datetime.now().strftime('%H:%M:%S IST')}`
    """)

st.markdown("---")

# -------------------------------------------------------------
# DUAL DASHBOARD VIEW
# -------------------------------------------------------------
col_left, col_right = st.columns([1.2, 1])

# LEFT COLUMN: IN-CAB DRIVER TELEMETRY
with col_left:
    st.markdown("### 🚂 **In-Cab Driver Telemetry HUD**")
    
    # Alert Status Banner
    if zone == "SAFE":
        st.markdown(f"""
        <div class="status-safe">
            <h4>{status_icon} ALL CLEAR // TRACK UNRESTRICTED</h4>
            <p>NavIC satellite telemetry indicates no wildlife intrusion within 2.0 km. Track cleared for standard line speed.</p>
        </div>
        """, unsafe_allow_html=True)
    elif zone == "ADVISORY":
        st.markdown(f"""
        <div class="status-warning">
            <h4>{status_icon} ADVISORY // HERD PROXIMITY DETECTED ({dist_km:.1f} KM)</h4>
            <p>NavIC broadcast received: Wildlife detected in 2 km buffer zone. Throttle down speed to 60 km/h immediately.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="status-critical">
            <h4>{status_icon} CRITICAL BRAKE // INTRUSION AT TRACK KM-142.4</h4>
            <p>HERD BREACHED 800M EMERGENCY BUFFER. FULL SERVICE BRAKE ENGAGED. 'PLAN BEE' ACOUSTIC DETERRENT ACTIVE.</p>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Speed & Limit Metrics
    m1, m2, m3 = st.columns(3)
    with m1:
        st.metric(label="Current Speed", value=f"{current_speed} km/h")
    with m2:
        st.metric(label="Safe Mandated Limit", value=f"{target_speed} km/h")
    with m3:
        st.metric(label="Distance to Herd", value=f"{dist_meters:.0f} m")

    # Physics Braking Math (v² = u² - 2as)
    st.markdown("#### 📐 **Dynamic Safe-Braking Physics**")
    st.markdown(f"""
    * **Locomotive Velocity ($u$):** `{u_ms:.1f} m/s` (`{current_speed} km/h`)
    * **Deceleration Rate ($a$):** `{decel_rate} m/s²`
    * **Braking Distance Required ($s = \\frac{{u^2}}{{2a}}$):** `{stopping_dist_req:.1f} meters`
    * **Available Safety Margin ($D - s$):** `+{margin:.1f} meters` **({'SAFE TO HALT' if margin > 0 else 'IMPACT HAZARD'})**
    """)
    st.progress(min(max(margin / dist_meters, 0.0), 1.0))

# RIGHT COLUMN: SATELLITE COMMAND & ACOUSTIC DETERRENT
with col_right:
    st.markdown("### 🐝 **Plan Bee & Satellite Relay**")
    
    if zone == "CRITICAL":
        st.error("🚨 'Plan Bee' Acoustic Deterrent: ACTIVE (Emitting ultrasonic honeybee buzz on exterior speakers)")
    elif zone == "ADVISORY":
        st.warning("⚠️ 'Plan Bee' Acoustic Deterrent: ARMED (Standby for emergency trigger)")
    else:
        st.success("✅ 'Plan Bee' Acoustic Deterrent: STANDBY (Normal transit)")
        
    st.markdown("#### 📋 **The 5 Core Innovations**")
    with st.expander("01 | Safe Braking Curve", expanded=True):
        st.write("Solves v² = u² − 2as live from speed, tonnage and gap — advises deceleration, not panic.")
    with st.expander("02 | Dual-Ring Geofencing"):
        st.write("2 km advisory ring: throttle 100 → 60 km/h. 800 m emergency ring: clamp to 25 km/h.")
    with st.expander("03 | 'Plan Bee' Acoustic Deterrent"):
        st.write("Honeybee acoustics from exterior speakers — wild animals avoid swarms and move off the line.")
    with st.expander("04 | Split-Screen Command"):
        st.write("In-cab HUD for locomotive pilots, paired with tactical geospatial maps for forest range officers.")
    with st.expander("05 | Satellite Blackbox"):
        st.write("Timestamped records of every NavIC packet for Indian Railways and MoEFCC regulatory audits.")

# -------------------------------------------------------------
# SATELLITE AUDIT BLACKBOX LOG (MoEFCC COMPLIANCE)
# -------------------------------------------------------------
st.markdown("---")
st.markdown("### 🛡️ **MoEFCC & Railway Satellite Blackbox Audit Trail**")

blackbox_data = [
    {"Timestamp": "22:14:02 IST", "Satellite Source": "NavIC-1I (S-Band)", "Event": "Packet broadcast synced with Train #12423", "Status": "ENCRYPTED"},
    {"Timestamp": "22:14:45 IST", "Satellite Source": "NavIC-1I (L5)", "Event": f"Animal proximity telemetry: {dist_km:.1f} km", "Status": zone},
    {"Timestamp": "22:15:10 IST", "Satellite Source": "Locomotive Telemetry", "Event": f"Throttle clamped to {target_speed} km/h. Deceleration margin: +{margin:.0f}m", "Status": "VERIFIED"}
]
st.table(blackbox_data)

st.caption("JungleOrbit · Binary Brains · ASTRA 2026 · VIT Bhopal University · No cellular network needed.")
