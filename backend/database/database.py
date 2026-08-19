import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    db_host = os.getenv("DB_HOST", "localhost")
    db_name = os.getenv("DB_NAME", "swipex_db")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "password_here")
    db_port = os.getenv("DB_PORT", "5432")

    conn = psycopg2.connect(
        host=db_host,
        database=db_name,
        user=db_user,
        password=db_password,
        port=db_port,
    )
    conn.autocommit = False
    return conn


def get_db_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)


def get_user_table_name(conn):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name IN ('users', 'accounts_customuser')
            ORDER BY table_name
            """
        )
        row = cursor.fetchone()

    if row:
        return row[0]

    return "users"
