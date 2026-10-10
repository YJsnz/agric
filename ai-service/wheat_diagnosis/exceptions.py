class WheatDiagnosisError(Exception):
    def __init__(self, message, code='inference_failed'):
        super().__init__(message)
        self.code = code
