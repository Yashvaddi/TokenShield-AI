import re
import unicodedata

class InjectionScanner:
    def __init__(self):
        # TSH-037: Regex pattern library pre-compiled
        self.patterns = [
            {"pattern": re.compile(r"(?i)(reveal|print|show)\s+(your\s+)?(system\s+)?prompt"), "weight": 35},
            {"pattern": re.compile(r"(?i)ignore\s+all\s+previous\s+instructions"), "weight": 30},
            {"pattern": re.compile(r"(?i)you\s+are\s+now\s+(DAN|unrestricted|acting\s+as)"), "weight": 40},
            {"pattern": re.compile(r"(?i)(enter|enable)\s+(developer|debug)\s+mode"), "weight": 25},
            {"pattern": re.compile(r"(?i)(list|print)\s+all\s+(users|database|passwords)"), "weight": 40},
            {"pattern": re.compile(r"(?i)(base64|hex)\s+(decode|encode)"), "weight": 35},
            {"pattern": re.compile(r"(?i)call\s+yourself\s+(again|recursively)"), "weight": 20},
            {"pattern": re.compile(r"(?i)as\s+(anthropic|your\s+creator)"), "weight": 30},
        ]

    def scan(self, prompt_text: str) -> dict:
        """
        Scans a prompt for injection attempts.
        """
        # TSH-039: Unicode normalization applied BEFORE pattern matching
        # Defeats homoglyph obfuscation (e.g. 'i' vs 'ı')
        normalized_text = unicodedata.normalize('NFKC', prompt_text.lower())
        
        score = 0
        matched_patterns = []
        
        # TSH-038: Scoring engine: iterate patterns, sum weights
        for item in self.patterns:
            if item["pattern"].search(normalized_text):
                score += item["weight"]
                matched_patterns.append(item["pattern"].pattern)
                
        # TSH-040: Injection enforcement: score >= 60 -> blocked
        blocked = score >= 60
        
        return {
            "score": score,
            "blocked": blocked,
            "matched_patterns": matched_patterns
        }

# Singleton instance
scanner = InjectionScanner()
