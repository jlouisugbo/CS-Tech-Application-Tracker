import os
from supabase import create_client

url = "https://bgmppiwflytcvbpdudfq.supabase.co"
key = "sb_secret_qXAPeB7oSsNVy5NtwtEP7A_RDFRDQHF"

supabase = create_client(url, key)
print("Connected successfully:", supabase is not None)
print("Key length:", len(key))