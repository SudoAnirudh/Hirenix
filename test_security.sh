#!/bin/bash
# Check if error messages are exposing sensitive details

grep -rnE "(HTTPException.*detail=.*str\(e\)|HTTPException.*detail=.*f\".*\{.*e.*\})" backend/
