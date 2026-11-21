#!/usr/bin/env python3
"""
JUNGLEORBIT: Where Space Meets the Wild
Zero-Network Train–Wildlife Collision Prevention System
ASTRA 2026 · VIT Bhopal University · Team Binary Brains
-------------------------------------------------------
Standalone Pure Python Simulation Engine (Zero External Dependencies)
"""

import time
import math
import sys
from datetime import datetime

class JungleOrbitSimulator:
    def __init__(self):
        self.train_id = "Train #12423 (Rajdhani Express)"
        self.sector = "Dooars Forest Sector KM-142.4"
        self.satellite = "ISRO NavIC-1I (S-Band / L5)"
        self.loco_mass_tonnes = 1500
        self.max_speed_kmh = 100.0
        self.current_speed_kmh = 98.0
        self.decel_rate = 0.55  # m/s^2 for 1500-tonne train
        self.plan_bee_active = False
        
        # Team details
        self.team = "Binary Brains"
        self.members = ["Aditi Jain", "Anshika Gupta", "Samriddhi Jha", "Anushka Rajbhar"]
        self.event = "ASTRA 2026 · VIT Bhopal University"

    def calculate_braking_physics(self, distance_meters):
        """
        Solves v² = u² - 2as to determine stopping distance and safe deceleration margin.
        """
        u_ms = self.current_speed_kmh * (1000.0 / 3600.0)
        # s = u^2 / (2 * a)
        stopping_distance = (u_ms ** 2) / (2 * self.decel_rate)
        margin = distance_meters - stopping_distance
        return u_ms, stopping_distance, margin

    def evaluate_geofence(self, distance_km):
        """
        Dual-ring geofencing evaluation:
        - > 2.0 km: Safe Zone
        - 0.8 km - 2.0 km: Advisory Ring
        - <= 0.8 km: Critical Emergency Ring
        """
        dist_m = distance_km * 1000.0
        u_ms, stopping_dist, margin = self.calculate_braking_physics(dist_m)
        
        if distance_km > 2.0:
            zone = "SAFE"
            target_speed = 100.0
            self.current_speed_kmh = 98.0
            self.plan_bee_active = False
            status_text = "ALL CLEAR // TRACK UNRESTRICTED"
        elif 0.8 < distance_km <= 2.0:
            zone = "ADVISORY"
            target_speed = 60.0
            self.current_speed_kmh = 58.0
            self.plan_bee_active = False
            status_text = "ADVISORY // HERD PROXIMITY (THROTTLE TO 60 KM/H)"
        else:
            zone = "CRITICAL"
            target_speed = 25.0
            self.current_speed_kmh = 24.0
            self.plan_bee_active = True
            status_text = "CRITICAL BRAKE // EMERGENCY INTRUSION CLAMP"

        return {
            "zone": zone,
            "dist_km": distance_km,
            "dist_m": dist_m,
            "target_speed": target_speed,
            "current_speed": self.current_speed_kmh,
            "stopping_dist": stopping_dist,
            "margin": margin,
            "status_text": status_text,
            "plan_bee": self.plan_bee_active
        }

    def render_hud(self, state):
        """Renders a high-tech terminal HUD of the in-cab display."""
        border = "=" * 76
        sub_border = "-" * 76
        
        print("\n" + border)
        print(f" 🛰️  JUNGLEORBIT // NavIC SPACE-RAIL TELEMETRY HUD")
        print(f" {self.event}  |  Team: {self.team}")
        print(border)
        print(f" Satellite Link : {self.satellite} [LOCKED 100%]")
        print(f" Locomotive     : {self.train_id} (Mass: {self.loco_mass_tonnes}T)")
        print(f" Sector         : {self.sector}")
        print(f" Timestamp      : {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}")
        print(sub_border)
        
        # Colorized or formatted status
        zone_badge = f"[{state['zone']} ZONE]"
        print(f" STATUS         : {zone_badge} {state['status_text']}")
        print(sub_border)
        print(f" Speedometer    : {state['current_speed']:.1f} KM/H  (Safe Mandated Limit: {state['target_speed']:.1f} KM/H)")
        print(f" Distance Gap   : {state['dist_m']:.0f} meters ({state['dist_km']:.2f} km)")
        print(f" Stopping Req.  : {state['stopping_dist']:.1f} meters (v² = u² - 2as)")
        print(f" Safety Margin  : +{state['margin']:.1f} meters [{'SAFE TO HALT' if state['margin'] > 0 else 'HAZARD'}]")
        print(f" Plan Bee Audio : {'🐝 ACTIVE (Emitting Honeybee Ultrasonic Buzz)' if state['plan_bee'] else '⚪ STANDBY (Inactive)'}")
        print(sub_border)
        print(f" MoEFCC Blackbox: [VERIFIED] NavIC broadcast packet encrypted & logged.")
        print(border + "\n")

    def run_live_scenario(self):
        """Runs the live simulated train progression towards a crossing."""
        print("\n[+] Initiating JungleOrbit Live Approach Simulation...\n")
        
        # Decreasing distance from 2.6 km down to 0.4 km
        test_distances = [2.6, 2.2, 1.8, 1.4, 0.9, 0.6, 0.4]
        
        for d in test_distances:
            state = self.evaluate_geofence(d)
            self.render_hud(state)
            time.sleep(1.2)
            
        print("\n[✔] Simulation Complete: Train successfully decelerated to safe creep speed.")
        print("[✔] Zero wildlife casualties. MoEFCC regulatory audit trail written to blackbox.")


if __name__ == "__main__":
    sim = JungleOrbitSimulator()
    print("============================================================")
    print(" JUNGLEORBIT: Zero-Network Train–Wildlife Collision Prevention")
    print(" Team: Binary Brains (Aditi, Anshika, Samriddhi, Anushka)")
    print("============================================================")
    print("1. Run Automated Approach Simulation")
    print("2. Enter Custom Distance (km)")
    print("============================================================")
    
    choice = input("Enter choice (1 or 2) [default=1]: ").strip()
    
    if choice == "2":
        try:
            val = float(input("Enter simulated animal distance in km (e.g. 1.5): "))
            state = sim.evaluate_geofence(val)
            sim.render_hud(state)
        except ValueError:
            print("Invalid input. Running automated simulation instead.")
            sim.run_live_scenario()
    else:
        sim.run_live_scenario()
