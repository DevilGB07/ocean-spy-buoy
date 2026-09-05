from fastapi import APIRouter
from app.schemas import AIClassifyRequest, AIClassifyResponse
from app.ai.demo_classifier import classifier

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/classify", response_model=AIClassifyResponse, summary="Classify vessel acoustic signature")
def classify_audio(payload: AIClassifyRequest = None):
    """
    Submits acoustic signal or extracted features to the Edge TinyML/Demo classifier.
    Returns predicted vessel classification label, confidence score, and frequency metrics.
    """
    features = payload.features if payload else None
    result = classifier.predict(audio_features_or_data=features)
    return result
