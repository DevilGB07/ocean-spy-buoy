import random
from typing import Dict, Any, Optional
from app.ai.base_classifier import BaseVesselClassifier

class DemoClassifier(BaseVesselClassifier):
    """
    Demo/Simulation classifier simulating an edge TinyML acoustic model.
    Evaluates acoustic signatures (frequency distribution, engine rumble, cavitation).
    """
    CLASSES = ["Tanker", "Cargo", "Fishing", "Passenger", "Background"]
    
    # Typical acoustic properties for vessels
    ACOUSTIC_PROFILES = {
        "Tanker": {"dom_freq": 142.5, "level_db": -31.2, "bandwidth": 45.0},
        "Cargo": {"dom_freq": 185.0, "level_db": -34.8, "bandwidth": 60.0},
        "Fishing": {"dom_freq": 340.0, "level_db": -42.1, "bandwidth": 95.0},
        "Passenger": {"dom_freq": 260.0, "level_db": -38.5, "bandwidth": 80.0},
        "Background": {"dom_freq": 45.0, "level_db": -68.0, "bandwidth": 200.0}
    }
    
    def predict(
        self, 
        audio_features_or_data: Optional[Any] = None, 
        forced_class: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classifies vessel acoustic signature.
        If forced_class is given (used in scenario benchmarks), matches that class
        with canonical confidence (e.g., 91% for Tanker in Scenario 1 & 3).
        """
        if forced_class and forced_class in self.CLASSES:
            selected_class = forced_class
            confidence = 0.91 if selected_class == "Tanker" else round(random.uniform(0.85, 0.94), 2)
        elif audio_features_or_data and isinstance(audio_features_or_data, dict):
            freq = audio_features_or_data.get("dominant_frequency_hz", 142.5)
            if freq < 60:
                selected_class = "Background"
                confidence = 0.88
            elif freq < 160:
                selected_class = "Tanker"
                confidence = 0.91
            elif freq < 230:
                selected_class = "Cargo"
                confidence = 0.89
            elif freq < 300:
                selected_class = "Passenger"
                confidence = 0.86
            else:
                selected_class = "Fishing"
                confidence = 0.87
        else:
            selected_class = "Tanker"
            confidence = 0.91
            
        profile = self.ACOUSTIC_PROFILES.get(selected_class, self.ACOUSTIC_PROFILES["Tanker"])
        
        return {
            "vessel_type": selected_class,
            "confidence": confidence,
            "model": "OceanSpy-TinyML-Demo",
            "dominant_frequency_hz": profile["dom_freq"],
            "audio_level_db": profile["level_db"]
        }

# Global singleton classifier instance
classifier = DemoClassifier()
