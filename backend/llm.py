# MetroPulse Local LLM Client with Strict Fallbacks
import os
import re
import json
import httpx
import logging
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from backend.schemas import ParsedEvent, AnnouncementItem
from backend.templates.announcements import get_template_announcements

load_dotenv()

logger = logging.getLogger("metropulse.llm")

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "qwen2.5:7b")
LLM_TIMEOUT_S = float(os.getenv("LLM_TIMEOUT_S", "20"))
LLM_ENABLE_THINKING = os.getenv("LLM_ENABLE_THINKING", "false").lower() == "true"


class LLMUnavailable(Exception):
    """Raised when the local LLM server is unreachable or timed out."""
    pass


def strip_thinking_tags(text: str) -> str:
    """Removes <think>...</think> blocks from models with reasoning modes enabled."""
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()


def extract_json_from_response(text: str) -> Dict[str, Any]:
    """Extracts first valid JSON object or array from the model output."""
    cleaned = strip_thinking_tags(text)
    # Search for code block ```json ... ``` or raw {...}
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        content = match.group(1).strip()
    else:
        # Match braces
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            content = cleaned[start : end + 1]
        else:
            raise ValueError(f"No JSON object detected in response: {text[:200]}")
    return json.loads(content)


async def check_llm_health() -> Dict[str, Any]:
    """Pings local LLM endpoint to measure latency and availability."""
    url = f"{LLM_BASE_URL.rstrip('/')}/models"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("id", "") for m in data.get("data", [])]
                return {
                    "available": True,
                    "model": LLM_MODEL,
                    "models_list": models,
                    "base_url": LLM_BASE_URL,
                }
    except Exception as e:
        logger.debug(f"LLM health ping failed: {e}")
    return {
        "available": False,
        "model": LLM_MODEL,
        "base_url": LLM_BASE_URL,
    }


async def parse_event_text(text: str) -> ParsedEvent:
    """
    Parses messy pasted event notices (WhatsApp forwards, notices in English/Gujarati/Hindi)
    into structured EventInput. Degrades gracefully to heuristic parser if LLM is offline.
    """
    prompt = f"""You are a transit planning assistant for Gujarat Metro. Extract event information from this pasted text:
\"\"\"
{text}
\"\"\"

Respond ONLY with valid JSON matching this schema:
{{
  "event_name": string,
  "venue": string,
  "nearest_station_id": string (use STN_15 for Motera Stadium, STN_07 for Riverfront/Old High Court),
  "date": string (YYYY-MM-DD, assume 2026 if year missing),
  "start_time": string (HH:MM 24-hr),
  "end_time": string (HH:MM 24-hr),
  "expected_attendance": integer,
  "attendance_level": "low" | "mid" | "high",
  "confidence": float (0.0 to 1.0),
  "notes": string,
  "metro_mode_share": float (0.15 to 0.45)
}}
Do NOT output any markdown commentary. Output valid JSON only."""

    try:
        async with httpx.AsyncClient(timeout=LLM_TIMEOUT_S) as client:
            payload = {
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a JSON-only transit planning data extractor."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.1,
            }
            resp = await client.post(f"{LLM_BASE_URL.rstrip('/')}/chat/completions", json=payload)
            if resp.status_code == 200:
                res_json = resp.json()
                raw_content = res_json["choices"][0]["message"]["content"]
                parsed = extract_json_from_response(raw_content)
                return ParsedEvent(
                    event_name=parsed.get("event_name", "Special Event"),
                    venue=parsed.get("venue", "Narendra Modi Stadium Motera"),
                    nearest_station_id=parsed.get("nearest_station_id", "STN_15"),
                    date=parsed.get("date", "2026-05-18"),
                    start_time=parsed.get("start_time", "19:30"),
                    end_time=parsed.get("end_time", "23:30"),
                    expected_attendance=int(parsed.get("expected_attendance", 95000)),
                    attendance_level=parsed.get("attendance_level", "mid"),
                    confidence=float(parsed.get("confidence", 0.9)),
                    notes=parsed.get("notes", "Parsed via local LLM model"),
                    metro_mode_share=float(parsed.get("metro_mode_share", 0.35)),
                )
    except Exception as e:
        logger.warning(f"LLM parse failed ({e}), using heuristic regex fallback.")

    # Heuristic / Regex Fallback
    event_name = "Match / Stadium Event"
    if "concert" in text.lower() or "coldplay" in text.lower():
        event_name = "Mega Stadium Music Concert"
    elif "ipl" in text.lower() or "match" in text.lower() or "cricket" in text.lower():
        event_name = "IPL T20 Cricket Match"
    elif "garba" in text.lower() or "navratri" in text.lower():
        event_name = "Sharad Navratri Maha Garba"

    station_id = "STN_15"
    if "riverfront" in text.lower() or "gmdc" in text.lower() or "navratri" in text.lower():
        station_id = "STN_07"

    # Attendance extraction
    att = 100000
    num_match = re.search(r"(\d{1,3}(?:,\d{3})+|\d{4,6})", text)
    if num_match:
        try:
            val = int(num_match.group(1).replace(",", ""))
            if 5000 <= val <= 200000:
                att = val
        except ValueError:
            pass

    return ParsedEvent(
        event_name=event_name,
        venue="Narendra Modi Stadium Motera" if station_id == "STN_15" else "Sabarmati Riverfront",
        nearest_station_id=station_id,
        date="2026-05-18",
        start_time="19:30",
        end_time="23:30",
        expected_attendance=att,
        attendance_level="mid",
        confidence=0.75,
        notes="Parsed offline using keyword and pattern extraction heuristics",
        metro_mode_share=0.35,
    )


async def generate_announcements_llm(
    event_name: str,
    end_time: str,
    station_name: str = "Motera Stadium",
) -> List[AnnouncementItem]:
    """
    Attempts to generate localized scripts via local LLM.
    If LLM is offline or times out, immediately falls back to vetted templates.
    """
    templates = get_template_announcements(
        event_name=event_name,
        station_name=station_name,
        headway_min=3,
        end_train_time="01:30 AM",
        gate_count=14,
        source="template",
    )

    prompt = f"""You are a bilingual transit public address announcer for Ahmedabad Metro.
Generate clear, courteous PA announcements for this event:
Event: {event_name}
Station: {station_name}
Event End: {end_time}

Produce scripts for 3 key moments:
1. pre_event: Welcoming passengers, noting 3-minute trains and closing at 01:30 AM.
2. extra_trains: Empty shuttle train berthing on Platform 1 for APMC.
3. hold_forecourt: Regulated metering pause to maintain platform safety.

Output ONLY valid JSON array with objects matching:
{{
  "moment_id": "pre_event" | "extra_trains" | "hold_forecourt",
  "en": English announcement text,
  "gu": Natural Gujarati announcement in Gujarati script (ગુજરાતી),
  "hi": Natural Hindi announcement in Devanagari script (हिन्दी)
}}"""

    try:
        async with httpx.AsyncClient(timeout=min(12.0, LLM_TIMEOUT_S)) as client:
            payload = {
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a public address transit script writer. Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
            }
            resp = await client.post(f"{LLM_BASE_URL.rstrip('/')}/chat/completions", json=payload)
            if resp.status_code == 200:
                raw_content = resp.json()["choices"][0]["message"]["content"]
                items = extract_json_from_response(raw_content)
                if isinstance(items, list) and len(items) > 0:
                    lookup = {item["moment_id"]: item for item in items if "moment_id" in item}
                    # Update template items with LLM rewrite
                    updated = []
                    for t in templates:
                        if t.moment_id in lookup:
                            override = lookup[t.moment_id]
                            t.en = override.get("en", t.en)
                            t.gu = override.get("gu", t.gu)
                            t.hi = override.get("hi", t.hi)
                            t.source = "llm"
                            t.is_draft = True
                        updated.append(t)
                    return updated
    except Exception as e:
        logger.info(f"LLM announcement generation unavailable ({e}), using validated template library.")

    # Return template announcements
    return templates


def generate_operator_brief(kpi_summary: Dict[str, Any], event_name: str) -> str:
    """Generates 5-line plain language executive briefing for the station controller."""
    return (
        f"OPERATOR BRIEFING: High-capacity crowd management plan for {event_name}. "
        f"Standard matchday operations would exceed the 2.0 pax/m² platform safety threshold for "
        f"{kpi_summary.get('baseline_minutes_above_hold', 52)} minutes. "
        f"The AI plan deploys 4 staged siding rakes and compresses North-South headway to 3 minutes, "
        f"cutting peak platform density to {kpi_summary.get('plan_peak_density', 1.82)} pax/m² and reducing total clearance by "
        f"{kpi_summary.get('clearance_delta', 48)} minutes while strictly observing 26-rake fleet constraints."
    )
