#!/bin/bash
PYENV_VERSION=3.10.20 pip install -r backend/requirements.txt pytest > /dev/null 2>&1
SUPABASE_URL=test SUPABASE_KEY=test SUPABASE_SERVICE_KEY=test JWT_SECRET=test PYTHONPATH=backend PYENV_VERSION=3.10.20 python -m pytest backend/tests/
