import spacy
from typing import List, Dict

nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> List[Dict]:
    doc = nlp(text)

    entities = []

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PERSON", "GPE"]:
            entities.append({
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
            })

    return entities
