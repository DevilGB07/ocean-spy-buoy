from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseVesselClassifier(ABC):
    """
    Abstract interface for acoustic vessel classifiers.
    Permits hot-swapping between Demo, ESP32-S3 TinyML, and PyTorch inference engines.
    """
    
    @abstractmethod
    def predict(self, audio_features_or_data: Optional[Any] = None) -> Dict[str, Any]:
        """
        Takes raw audio samples or preprocessed feature vectors,
        and returns classification label, confidence score, and model metadata.
        """
        pass
