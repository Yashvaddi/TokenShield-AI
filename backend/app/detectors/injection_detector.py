import re
import unicodedata
import yaml
import os

class InjectionScanner:
    def __init__(self, config_path: str = None):
        if not config_path:
            config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'injection_rules.yaml')
        
        self.patterns = []
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
                
            # TSH-037: Regex pattern library pre-compiled at startup
            for item in config.get('patterns', []):
                self.patterns.append({
                    "category": item["category"],
                    "pattern": re.compile(item["regex"]),
                    "weight": item["weight"]
                })
        except Exception as e:
            # Fallback if config is missing during tests
            print(f"Warning: Could not load injection_rules.yaml: {e}")
            self.patterns = [
                {"category": "Fallback", "pattern": re.compile(r"(?i)ignore\s+all\s+previous\s+instructions"), "weight": 30}
            ]

    def scan(self, prompt_text: str) -> dict:
        """
        Scans a prompt for injection attempts using pre-compiled regex and NFKC normalization.
        """
        if not prompt_text:
            return {'score': 0, 'blocked': False, 'matched_patterns': []}

        # TSH-039: Unicode normalization applied BEFORE pattern matching
        # Defeats homoglyph obfuscation (e.g. 'i' vs 'ı', Cyrillic 'a')
        normalized_text = unicodedata.normalize('NFKC', prompt_text.lower())
        
        score = 0
        matched_patterns = []
        
        # TSH-038: Scoring engine: iterate patterns, sum weights
        for item in self.patterns:
            if item["pattern"].search(normalized_text):
                score += item["weight"]
                matched_patterns.append({
                    "category": item["category"],
                    "regex": item["pattern"].pattern
                })
                
        # TSH-040: Injection enforcement: score >= 60 -> blocked
        blocked = score >= 60
        
        return {
            "score": score,
            "blocked": blocked,
            "matched_patterns": matched_patterns,
            "normalized_text": normalized_text
        }

# Singleton instance pre-compiled on startup
_scanner = InjectionScanner()

def score_prompt(prompt: str) -> dict:
    """
    Public entry point for the scanner.
    """
    return _scanner.scan(prompt)
