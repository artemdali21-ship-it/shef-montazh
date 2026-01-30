#!/bin/bash

echo "🧪 Testing Shef-Montazh API Endpoints"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Get Worker Profile
echo "📋 Test 1: Get Worker Profile"
curl -s "${BASE_URL}/api/profiles/worker?userId=e0869f87-fac1-46da-bc5a-f8be66d85094"
echo ""
echo "---"
echo ""

# Test 2: Get Shifts Feed
echo "📋 Test 2: Get Shifts Feed"
curl -s "${BASE_URL}/api/shifts/feed?limit=3"
echo ""
echo "---"
echo ""

# Test 3: Get Shift by ID
echo "📋 Test 3: Get Shift Details"
curl -s "${BASE_URL}/api/shifts/51111111-1111-1111-1111-111111111111"
echo ""
echo "---"
echo ""

echo "✅ Tests completed!"
