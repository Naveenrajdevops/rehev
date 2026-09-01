"""
Vercel Serverless Function Handler for RehabAI FastAPI Backend
This file is the entry point for Vercel to route /api/* requests to the FastAPI application.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI application
from app.main import app

# Export the app for Vercel
# Vercel automatically detects and uses the 'app' variable
__all__ = ["app"]
