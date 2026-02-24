#!/usr/bin/env python3
"""
Find cheapest flights from Delhi (DEL) to Toronto (YYZ)
Date range: March 8-12, 2026
Routes: Direct, via Europe, or via Middle East (NO US routes)
Uses Brave Search API for web scraping flight deals.
"""

import os
import re
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BRAVE_API_KEY = os.getenv("BRAVE_SEARCH")
if not BRAVE_API_KEY:
    print("ERROR: BRAVE_SEARCH not found in .env file.")
    print("Add this line to your .env file:")
    print('  BRAVE_SEARCH=your_key_here')
    exit(1)

BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"
HEADERS = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip",
    "X-Subscription-Token": BRAVE_API_KEY,
}

# Flight search config
DATES = {
    "2026-03-08": {"day": "Sunday",   "skyscanner": "260308", "kayak": "2026-03-08", "label": "March 8 (Sun)"},
    "2026-03-09": {"day": "Monday",   "skyscanner": "260309", "kayak": "2026-03-09", "label": "March 9 (Mon)"},
    "2026-03-10": {"day": "Tuesday",  "skyscanner": "260310", "kayak": "2026-03-10", "label": "March 10 (Tue)"},
    "2026-03-11": {"day": "Wednesday","skyscanner": "260311", "kayak": "2026-03-11", "label": "March 11 (Wed)"},
    "2026-03-12": {"day": "Thursday", "skyscanner": "260312", "kayak": "2026-03-12", "label": "March 12 (Thu)"},
}

PREFERRED_AIRLINES = [
    "Air Canada", "Air India",
    "Emirates", "Qatar Airways", "Etihad Airways", "Etihad",
    "Turkish Airlines", "Lufthansa", "British Airways",
    "KLM", "Swiss", "Austrian Airlines", "Air France",
]

US_INDICATORS = [
    "via new york", "via newark", "via chicago", "via los angeles",
    "via san francisco", "via washington", "via houston", "via dallas",
    "via atlanta", "via seattle", "via boston", "via jfk", "via ewr",
    "via ord", "via lax", "via sfo", "via iah", "via dfw", "via atl",
    "united airlines",
]

ME_HUBS = ["dubai", "doha", "abu dhabi", "muscat", "bahrain", "kuwait", "riyadh", "jeddah"]
EU_HUBS = ["london", "frankfurt", "paris", "amsterdam", "istanbul", "zurich", "munich", "vienna"]


def brave_search(query: str, count: int = 10) -> list[dict]:
    """Run a Brave web search and return organic results."""
    params = {"q": query, "count": count}
    resp = requests.get(BRAVE_SEARCH_URL, headers=HEADERS, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    results = data.get("web", {}).get("results", [])
    return [{"title": r["title"], "url": r["url"], "description": r.get("description", "")} for r in results]


def extract_price(text: str) -> str:
    patterns = [
        r'[\$][\d,]+',
        r'[\₹][\d,]+',
        r'(?:CAD|USD|INR|EUR|GBP)\s*[\d,]+',
        r'[\d,]+\s*(?:CAD|USD|INR|EUR|GBP)',
    ]
    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return "—"


def detect_route(text: str) -> str:
    if "direct" in text or "non-stop" in text or "nonstop" in text:
        return "Direct"
    for hub in ME_HUBS:
        if hub in text:
            return f"Via {hub.title()}"
    for hub in EU_HUBS:
        if hub in text:
            return f"Via {hub.title()}"
    return "—"


def detect_airline(text: str) -> str:
    for a in PREFERRED_AIRLINES:
        if a.lower() in text:
            return a
    return "—"


def is_us_route(text: str) -> bool:
    return any(ind in text for ind in US_INDICATORS)


def search_date_specific() -> dict:
    """Search for flights on each specific date."""
    date_results = {}

    for date_str, info in DATES.items():
        label = info["label"]
        print(f"\n  === Searching for {label} ===")
        results = []

        queries = [
            f"cheapest flight Delhi DEL to Toronto YYZ {date_str} one way no US layover",
            f"flight Delhi to Toronto {label.split('(')[0].strip()} 2026 price via Dubai Doha Istanbul",
            f"Skyscanner Kayak Delhi Toronto {date_str} cheap flight",
        ]

        for q in queries:
            print(f"    {q[:75]}...")
            try:
                results.extend(brave_search(q, count=5))
            except Exception as e:
                print(f"    [warn] {e}")

        date_results[date_str] = results

    return date_results


def search_airline_specific() -> list[dict]:
    """Search for airline-specific flights across all dates."""
    results = []
    airline_queries = [
        ("Emirates", "Emirates flight Delhi to Toronto March 8-12 2026 price via Dubai"),
        ("Qatar Airways", "Qatar Airways flight Delhi to Toronto March 2026 cheapest via Doha"),
        ("Etihad", "Etihad flight Delhi to Toronto March 2026 price via Abu Dhabi"),
        ("Turkish Airlines", "Turkish Airlines Delhi to Toronto March 2026 price via Istanbul"),
        ("Air Canada", "Air Canada Delhi to Toronto direct flight March 2026 price"),
        ("Air India", "Air India Delhi to Toronto March 2026 flight price"),
        ("Lufthansa", "Lufthansa Delhi to Toronto March 2026 price via Frankfurt"),
        ("British Airways", "British Airways Delhi to Toronto March 2026 price via London"),
        ("KLM", "KLM Delhi to Toronto March 2026 price via Amsterdam"),
        ("Air France", "Air France Delhi to Toronto March 2026 price via Paris"),
    ]

    for airline, query in airline_queries:
        print(f"  {airline}...")
        try:
            results.extend(brave_search(query, count=3))
        except Exception as e:
            print(f"    [warn] {e}")

    return results


def search_aggregators() -> list[dict]:
    """Search flight aggregators."""
    results = []
    queries = [
        "site:skyscanner.com Delhi Toronto March 2026 cheapest flight",
        "site:kayak.com Delhi DEL Toronto YYZ March 2026 cheapest",
        "site:momondo.com Delhi Toronto March 2026 cheap flight",
        "Google Flights DEL to YYZ March 8 to 12 2026 cheapest one way",
    ]

    for q in queries:
        print(f"  {q[:70]}...")
        try:
            results.extend(brave_search(q, count=5))
        except Exception as e:
            print(f"    [warn] {e}")

    return results


def process_results(raw: list[dict], date_tag: str = "") -> list[dict]:
    """Process raw search results into structured flight info."""
    flights = []
    seen = set()

    for item in raw:
        url = item["url"]
        if url in seen:
            continue
        seen.add(url)

        combined = f"{item['title'].lower()} {item['description'].lower()}"
        if is_us_route(combined):
            continue

        flights.append({
            "title": item["title"],
            "url": url,
            "description": item["description"][:250],
            "price": extract_price(combined),
            "airline": detect_airline(combined),
            "route": detect_route(combined),
            "date": date_tag,
        })

    return flights


def generate_booking_links() -> dict:
    """Generate direct booking links for each date and airline."""
    links = {}
    for date_str, info in DATES.items():
        d = date_str.replace("-", "")  # 20260308
        sk = info["skyscanner"]
        ky = info["kayak"]
        label = info["label"]

        links[date_str] = {
            "label": label,
            "aggregators": [
                ("Google Flights", f"https://www.google.com/travel/flights?q=flights+from+DEL+to+YYZ+on+{date_str}"),
                ("Skyscanner",     f"https://www.skyscanner.ca/transport/flights/del/yyz/{sk}/"),
                ("Kayak",          f"https://www.kayak.com/flights/DEL-YYZ/{ky}?sort=price_a"),
                ("Momondo",        f"https://www.momondo.com/flight-search/DEL-YYZ/{ky}?sort=price_a"),
            ],
            "airlines": [
                ("Emirates (via Dubai)",        f"https://www.emirates.com/flights/search?origin=DEL&destination=YYZ&departureDate={date_str}&adult=1"),
                ("Qatar Airways (via Doha)",    f"https://www.qatarairways.com/en/booking.html?origins=DEL&destinations=YYZ&departureDates={date_str}&pax=1"),
                ("Etihad (via Abu Dhabi)",       f"https://www.etihad.com/en/fly-etihad/book?departure=DEL&arrival=YYZ&date={date_str}&passengers=1"),
                ("Turkish Airlines (via IST)",   f"https://www.turkishairlines.com/en/flights-from-delhi-to-toronto"),
                ("Air Canada (Direct possible)", f"https://www.aircanada.com/en-ca/flights-from-delhi-to-toronto"),
                ("Air India",                    f"https://www.airindia.com/en-us/book-flights/delhi-to-toronto-flights"),
                ("Lufthansa (via Frankfurt)",    f"https://www.lufthansa.com/lhg/in/en/o-d/cy-cy/delhi-toronto"),
                ("British Airways (via London)", f"https://www.britishairways.com/travel/book/public/en_in?origin=DEL&destination=YYZ&departureDate={date_str}"),
                ("KLM (via Amsterdam)",          f"https://www.klm.com/search/flights?origin=DEL&destination=YYZ&departureDate={date_str}&pax=1"),
                ("Air France (via Paris)",       f"https://www.airfrance.in/search/offer?origin=DEL&destination=YYZ&outboundDate={date_str}&pax=1"),
            ],
        }
    return links


def print_report(date_flights: dict, airline_flights: list, aggregator_flights: list, booking_links: dict):
    """Print the full report with dates and links."""

    print("\n" + "=" * 90)
    print("  CHEAPEST FLIGHTS: Delhi (DEL) → Toronto (YYZ)")
    print("  Dates: March 8-12, 2026 | NO US layovers | Direct / Europe / Middle East routes")
    print("=" * 90)

    # --- Section 1: Date-wise search results ---
    print("\n" + "─" * 90)
    print("  SECTION 1: DATE-WISE SEARCH RESULTS")
    print("─" * 90)

    for date_str, info in DATES.items():
        label = info["label"]
        flights = date_flights.get(date_str, [])
        priced = [f for f in flights if f["price"] != "—"]
        priced.sort(key=lambda x: x["price"])

        print(f"\n  ┌── {label} ──────────────────────────────────────────────────")
        if priced:
            for f in priced[:5]:
                airline_str = f["airline"] if f["airline"] != "—" else ""
                route_str = f["route"] if f["route"] != "—" else ""
                tag = " | ".join(filter(None, [airline_str, route_str]))
                print(f"  │  {f['price']:>12s}  {tag}")
                print(f"  │              {f['title'][:70]}")
                print(f"  │              {f['url']}")
                print(f"  │")
        else:
            print(f"  │  No specific prices found — check links below")
            # Show top 3 results anyway
            for f in flights[:3]:
                print(f"  │  {f['title'][:70]}")
                print(f"  │  {f['url']}")
                print(f"  │")
        print(f"  └────────────────────────────────────────────────────────────────")

    # --- Section 2: Airline-specific results ---
    print("\n" + "─" * 90)
    print("  SECTION 2: AIRLINE-SPECIFIC RESULTS (all dates)")
    print("─" * 90)

    priced_airlines = [f for f in airline_flights if f["price"] != "—"]
    priced_airlines.sort(key=lambda x: x["price"])

    if priced_airlines:
        for f in priced_airlines[:15]:
            route_str = f["route"] if f["route"] != "—" else ""
            print(f"\n  {f['price']:>12s}  {f['airline']} {route_str}")
            print(f"               {f['title'][:70]}")
            print(f"               {f['url']}")
    else:
        print("\n  No specific prices found in airline searches. Check links below.")

    # Also show unpriced airline results with useful links
    unpriced_airlines = [f for f in airline_flights if f["price"] == "—" and f["airline"] != "—"]
    if unpriced_airlines:
        print(f"\n  Other airline pages (check for prices):")
        seen_airlines = set()
        for f in unpriced_airlines:
            if f["airline"] not in seen_airlines:
                seen_airlines.add(f["airline"])
                route_str = f["route"] if f["route"] != "—" else ""
                print(f"  • {f['airline']:25s} {route_str}")
                print(f"    {f['url']}")

    # --- Section 3: Aggregator results ---
    print("\n" + "─" * 90)
    print("  SECTION 3: AGGREGATOR RESULTS")
    print("─" * 90)

    agg_priced = [f for f in aggregator_flights if f["price"] != "—"]
    agg_priced.sort(key=lambda x: x["price"])
    for f in (agg_priced or aggregator_flights)[:10]:
        price_str = f["price"] if f["price"] != "—" else "check link"
        print(f"\n  {price_str:>12s}  {f['title'][:65]}")
        print(f"               {f['url']}")

    # --- Section 4: Direct booking links per date ---
    print("\n" + "═" * 90)
    print("  SECTION 4: DIRECT BOOKING LINKS (per date)")
    print("═" * 90)

    for date_str, data in booking_links.items():
        label = data["label"]
        print(f"\n  ╔══ {label} {'═' * (80 - len(label))}╗")

        print(f"  ║  Aggregators (compare prices):")
        for name, url in data["aggregators"]:
            print(f"  ║    {name:18s} → {url}")

        print(f"  ║")
        print(f"  ║  Airlines (book direct):")
        for name, url in data["airlines"]:
            print(f"  ║    {name:32s} → {url}")

        print(f"  ╚{'═' * 87}╝")

    # --- Tips ---
    print("\n" + "─" * 90)
    print("  TIPS FOR CHEAPEST BOOKING:")
    print("─" * 90)
    print("  1. Best non-US routes: Emirates (DXB), Qatar (DOH), Turkish (IST), Etihad (AUH)")
    print("  2. Air Canada may have direct DEL→YYZ — check Google Flights")
    print("  3. Tuesday/Wednesday departures (Mar 10-11) are typically cheaper")
    print("  4. Compare in INR vs CAD — sometimes Indian OTAs have better rates")
    print("  5. Set fare alerts on Google Flights + Skyscanner for price drops")
    print("  6. Check Momondo & Kayak — they often surface hidden-city fares")
    print("  7. Booking 6-8 weeks ahead (now!) is typically the sweet spot")
    print("=" * 90)


def main():
    print("\n  ✈  Flight Finder: Delhi (DEL) → Toronto (YYZ)")
    print("     Dates: March 8, 9, 10, 11, 12 — 2026")
    print("     Routes: Direct / Europe / Middle East (NO US layovers)")
    print("     " + "─" * 55)

    # 1. Date-specific searches
    print("\n  [1/3] Searching by date...")
    raw_date_results = search_date_specific()
    date_flights = {}
    for date_str, raw in raw_date_results.items():
        date_flights[date_str] = process_results(raw, date_tag=date_str)

    # 2. Airline-specific searches
    print("\n  [2/3] Searching by airline...")
    raw_airline = search_airline_specific()
    airline_flights = process_results(raw_airline)

    # 3. Aggregator searches
    print("\n  [3/3] Searching aggregators...")
    raw_agg = search_aggregators()
    aggregator_flights = process_results(raw_agg)

    # 4. Generate booking links
    booking_links = generate_booking_links()

    # 5. Print report
    print_report(date_flights, airline_flights, aggregator_flights, booking_links)

    # 6. Save to JSON
    output_path = Path(__file__).resolve().parent / "flight_results.json"
    all_flights = []
    for d, fl in date_flights.items():
        all_flights.extend(fl)
    all_flights.extend(airline_flights)
    all_flights.extend(aggregator_flights)

    with open(output_path, "w") as f:
        json.dump({
            "search_date": datetime.now().isoformat(),
            "dates_searched": list(DATES.keys()),
            "booking_links": {d: {
                "label": v["label"],
                "aggregators": {name: url for name, url in v["aggregators"]},
                "airlines": {name: url for name, url in v["airlines"]},
            } for d, v in booking_links.items()},
            "flights": all_flights,
        }, f, indent=2)
    print(f"\n  Results saved to: {output_path}\n")


if __name__ == "__main__":
    main()
