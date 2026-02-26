import pandas as pd
from sqlalchemy.exc import IntegrityError
from app.database import SessionLocal
from app.models import Supplier
from app.services.entity_resolution_service import normalize


def seed():
    db = SessionLocal()

    try:
        df = pd.read_csv("data/supplier_dataset_750.csv")
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return

    inserted = 0
    skipped = 0

    for _, row in df.iterrows():

        normalized_name = normalize(row["name"])

        # Prevent duplicates (based on name + country)
        exists = (
            db.query(Supplier)
            .filter(
                Supplier.normalized_name == normalized_name,
                Supplier.country == row["country"],
            )
            .first()
        )

        if exists:
            skipped += 1
            continue

        supplier = Supplier(
            name=row["name"],
            normalized_name=normalized_name,
            country=row["country"],
            industry=row["industry"],
            annual_revenue=row["annual_revenue_usd"],
            ownership_type=row["ownership_type"],
            parent_company=row["parent_company"]
            if pd.notna(row["parent_company"])
            else None,
            tier_level=int(row["tier_level"]),
            is_global=True,          # 🔥 Important
            organization_id=None,    # Global dataset
        )

        db.add(supplier)
        inserted += 1

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        print(f"Database integrity error: {e}")
        return
    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {e}")
        return
    finally:
        db.close()

    print(f"Inserted: {inserted}")
    print(f"Skipped (duplicates): {skipped}")


if __name__ == "__main__":
    seed()