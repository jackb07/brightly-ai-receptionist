README.md (Private Business Version)
Brightly AI Receptionist – Internal Setup Guide

DO NOT SHARE THIS PUBLICLY – contains internal deployment details for Brightly AI’s receptionist service.

1. Overview

Brightly AI Receptionist automatically answers calls, checks booking availability (Cal.com API), and can transfer calls to a human via Twilio.
It uses:

Node.js + Express for the server

Twilio for telephony

Cal.com API for booking checks

ElevenLabs for AI voice

Docker + Render for hosting

2. Local Development Setup
Install dependencies:
npm install

Run locally without Docker:
npm start


Server will run on:

http://localhost:3000

3. Run with Docker (Local)
Build & start:
docker-compose up --build


This uses .env in your project root.

4. Environment Variables

These must be set both locally (in .env) and in Render’s Environment Settings.

Variable	Purpose
TWILIO_ACCOUNT_SID	Twilio account SID
TWILIO_AUTH_TOKEN	Twilio auth token
TWILIO_NUMBER	Twilio phone number
HUMAN_NUMBER	Phone number to forward to
CALCOM_API_KEY	API key for Cal.com
SYSTEM_PROMPT	AI voice prompt
BASE_URL	Public URL of the deployed app

Example .env (never commit this file to GitHub):

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_NUMBER=+15551234567
HUMAN_NUMBER=+15559876543
CALCOM_API_KEY=cal_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
SYSTEM_PROMPT=You are a professional, warm, and efficient receptionist for Brightly AI.
BASE_URL=https://brightly-ai.onrender.com

5. Deploy to Render

Push your code to the main branch of GitHub.

Create a Web Service in Render.

Link it to this repo.

In "Environment Variables", copy all vars from .env.

Set:

Build Command: npm install
Start Command: npm start


Deploy.

6. Connect ElevenLabs

After deployment, Render will give you a public URL like:

https://brightly-ai.onrender.com


In ElevenLabs’ tool settings, use:

Tool 1: Check booking
POST  https://brightly-ai.onrender.com/elevenlabs/tool/check_booking

Tool 2: Transfer call
POST  https://brightly-ai.onrender.com/transfer

7. API Routes
Check Booking

POST /elevenlabs/tool/check_booking
Body:

{ "date": "2025-08-14", "time": "14:00" }

Transfer Call

POST /transfer

8. Notes & Maintenance

Always update .env in Render when you change API keys or phone numbers.

Keep your repo private — this is your business asset.

Run docker-compose up --build after changes to test locally before deploying.
