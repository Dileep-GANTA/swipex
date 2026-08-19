import psycopg2
from psycopg2 import sql


DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "postgres",
    "user": "postgres",
    "password": "vikkihema",
}


CREATE_USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

VERIFY_USERS_TABLE_SQL = """
SELECT to_regclass('public.users') AS table_name;
"""


def create_users_table():
    try:
        print("Connecting to PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()

        print("Connection successful.")
        print("Creating users table...")
        cursor.execute(CREATE_USERS_TABLE_SQL)
        print("users table created successfully or already exists.")

        print("Verifying users table...")
        cursor.execute(VERIFY_USERS_TABLE_SQL)
        result = cursor.fetchone()
        print(f"Verification result: {result[0]}")

        cursor.close()
        conn.close()
        print("Database connection closed.")

    except psycopg2.Error as e:
        print(f"PostgreSQL error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    create_users_table()
