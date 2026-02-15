from app.graph.graph_client import get_session

def create_entity_node(name: str, entity_type: str):
    with get_session() as session:
        session.run(
            """
            MERGE (e:Entity {name: $name})
            SET e.type = $type
            """,
            name=name,
            type=entity_type
        )

def create_relationship(subject: str, obj: str, relation: str, confidence: float):
    with get_session() as session:
        session.run(
            """
            MATCH (a:Entity {name: $subject})
            MATCH (b:Entity {name: $object})
            MERGE (a)-[r:RELATION {type: $relation}]->(b)
            SET r.confidence = $confidence
            """,
            subject=subject,
            object=obj,
            relation=relation,
            confidence=confidence
        )
