from .base import *

# Production overrides (e.g. ALLOWED_HOSTS, DEBUG=False, security settings)
DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
