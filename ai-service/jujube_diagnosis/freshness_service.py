from .leaf_service import analyze as classify

def analyze(registry, image):
    return classify(registry, image, 'fruit_freshness')
