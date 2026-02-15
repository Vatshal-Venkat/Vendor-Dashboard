import re
from typing import List

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    return re.split(r'(?<=[.!?]) +', text)
