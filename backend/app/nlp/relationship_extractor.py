import spacy
from typing import List, Dict

nlp = spacy.load("en_core_web_sm")

def extract_relationships(text: str) -> List[Dict]:
    doc = nlp(text)

    relationships = []

    for token in doc:
        if token.dep_ == "ROOT" and token.pos_ == "VERB":
            subject = None
            obj = None

            for child in token.children:
                if child.dep_ in ["nsubj", "nsubjpass"]:
                    subject = child.text
                if child.dep_ in ["dobj", "pobj"]:
                    obj = child.text

            if subject and obj:
                relationships.append({
                    "subject": subject,
                    "relationship": token.text,
                    "object": obj
                })

    return relationships
