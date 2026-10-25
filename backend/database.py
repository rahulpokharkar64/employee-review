import os
from pathlib import Path
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool

# Read only this project's backend/.env. Without an explicit path, python-dotenv searches parent folders
# and can pick up another project's .env.
load_dotenv(Path(__file__).resolve().parent / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")

# Opened lazily on first use so importing this module (e.g. in tests) needs no database
pool = ConnectionPool(DATABASE_URL or "", open=False, min_size=1, max_size=10)

def get_connection(timeout=None):
    """Use as `with get_connection() as conn:`. Commits on success, rolls back on error.
    `timeout` is how many seconds to wait for a connection; None uses the pool default (30 s)."""
    if pool.closed:
        pool.open()
    return pool.connection(timeout=timeout)
