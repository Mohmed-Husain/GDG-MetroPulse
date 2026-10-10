# Research Notes, Traceability & Confidence Analysis

**Dataset Scope**: Gujarat Metro (Ahmedabad–Gandhinagar Corridor), operated by Gujarat Metro Rail Corporation (GMRC) Limited.
**Data Reflection Date**: October 2026 (Reflecting operational Phase 1 + fully commissioned Phase 2 Yellow Line to Mahatma Mandir).

---

## 1. Operational Status Summary
As of 2026, the complete Ahmedabad–Gandhinagar rapid transit spine is operational:
1. **Phase 1 Red Line**: APMC to Motera Stadium (18.87 km, 15 elevated stations) — Inaugurated September 30, 2022.
2. **Phase 2 Yellow Line (Initial Leg)**: Motera Stadium to Sector-1, Gandhinagar + GNLU to GIFT City spur (14 stations) — Inaugurated September 16, 2024.
3. **Phase 2 Yellow Line (Final Leg)**: Sector-10A through Sachivalaya to Mahatma Mandir (5.36 km, 6 stations) — Inaugurated January 11, 2026.
4. **Current Route Extent**: 35 contiguous stations from APMC in South Ahmedabad to Mahatma Mandir in central Gandhinagar (~40.6 km route length), with interchange to Blue Line at Old High Court and GIFT City spur at GNLU.

---

## 2. Top 5 Events by Metro Crowd Impact
1. **IPL Matches & International Cricket at Narendra Modi Stadium (Motera)**: 1,32,000 venue capacity; metro station is directly adjacent (200m). Drives single-day surges of 55,000–75,000 extra passengers within a 2-hour window.
2. **Sharad Navratri (9 Nights of Garba)**: Overnight travel patterns; passenger flow shifts to 21:00–02:30. Systemwide ridership increases by ~35,000 trips nightly across central stations (Old High Court, Paldi, Usmanpura).
3. **Coldplay & Mega Stadium Concerts**: Up to 4.11 lakh total metro journeys over a 2-day concert weekend. Severe concourse queue bottlenecks.
4. **Ahmedabad Jagannath Rath Yatra**: 10–15 lakh devotees throng the old city; total surface road closures divert ~75,000 commuters onto the metro spine.
5. **International Kite Festival (Uttarayan)**: Daytime leisure surge across Sabarmati Riverfront stations (40,000+ daily leisure passengers).

---

## 3. Operating Constraints & Feasibility Analysis

### Skip-Stop on Double-Track Metros Without Passing Loops
- **Operational Reality**: On a twin-track metro without passing sidings or loop lines (like the Ahmedabad North-South mainline), true express trains running behind all-stop local trains cannot overtake. A train skipping stations will inevitably catch up to the train ahead, resulting in red signal stops, train bunching, and zero net end-to-end time savings.
- **Feasible Levers**:
  1. **Short-Turning (Zonal Dispatch)**: Running extra train sets exclusively between high-density segments (e.g., APMC <-> Motera Stadium or Motera <-> Infocity) doubles frequency where demand is acute without wasting empty vehicle-kilometers on the outer extremities.
  2. **Dynamically Compressed Headway**: Lowering headway from 12 min down to the CBTC signaling floor of 90–120 seconds during surge clearance.
  3. **Reduced Dwell Control**: Cutting platform dwell from 30 seconds to 15–20 seconds when platform sensors report low boarding activity.
  4. **Conditional Zero-Demand Skip**: Skipping non-protected intermediate stations only if automated gate count confirms zero boardings and in-train sensors confirm zero alightings.

### Ticketing Gate Data Characteristics
- **QR Codes**: Passenger selects destination at purchase; provides true Origin-Destination pair at the moment of entry.
- **Smart Cards & NCMC**: Tap-in registers only Origin; Destination is captured upon Tap-out. Dispatch models estimate destination using historical OD probability matrices.

---

## 4. Confidence and Gaps

### 10 Values with Lowest Confidence (Flagged for Coder Agent):
1. `platform_width_m`: Station platform widths are not officially published as open data; estimated between 9m and 14m based on standard GMRC civil tender drawings.
2. `standing_comfort_per_coach`: Derived from 3.0 pax/m² standard transit comfort guideline; GMRC publishes only crush (6 pax/m²) and dense crush (8 pax/m²).
3. `door_flow_pax_per_second`: Estimated at 1.3 pax/sec based on standard Indian railway / UITP transit boarding benchmarks for 1.4m wide doors.
4. `metro_mode_share_estimate`: Festival and event mode shares (8% to 35%) are transit planning estimates derived from post-event crowd reports and parking capacity constraints.
5. `fleet_available_for_service`: Estimated at 26 out of 32 rakes based on standard 18% transit maintenance reserve.
6. `terminal_turnback_minutes`: Estimated at 2.5 minutes based on CBTC automated route setting and scissor crossover geometry.
7. `inter-station run_time_to_next_min`: Official timetable publishes scheduled departure blocks (1-2 min rounding); actual run time varies dynamically by ~10-15 seconds.
8. `historical attendance for Rath Yatra / Navratri`: Public crowd figures in local press vary between 8 lakh and 15 lakh; midpoints are provided.
9. `smart card vs QR exact percentage split`: Estimated at 65% QR / 25% Card / 10% counter tokens from GMRC earnings and press release descriptions.
10. `concourse_holding_threshold_los`: Derived from NFPA 130 and Fruin pedestrian standards rather than GMRC rulebooks.

---

## 5. Numbered List of Authoritative Sources

1. **Gujarat Metro Rail Corporation (GMRC) Limited** — Official Project Overview & Network Corridors: `https://www.gujaratmetrorail.com/project-overview2/` (Published July 23, 2026).
2. **Gujarat Metro Rail Corporation (GMRC) Limited** — Detailed Project Report (DPR) for Ahmedabad Metro Phase-2: `https://www.gujaratmetrorail.com/wp-content/uploads/DPR/Phase-II-DPR_Mar-19_opt.pdf` (Published March 2019).
3. **Gujarat Metro Rail Corporation (GMRC) Limited** — Detailed Project Report (DPR) for Ahmedabad Metro Phase-1: `https://www.gujaratmetrorail.com/wp-content/uploads/DPR/DPR-March-2015_opt.pdf` (Published March 2015).
4. **Gujarat Metro Rail Corporation (GMRC) Limited** — Train Information, Route Map & Fare Rules: `https://www.gujaratmetrorail.com/ahmedabad/route-and-fares/` & `https://www.gujaratmetrorail.com/ahmedabad/fare-rules/` (Published March 2026 & October 2026).
5. **The Hindu** — "Ahmedabad–Gandhinagar Metro ridership rises fourfold in three years": `https://www.thehindu.com/news/national/gujarat/ahmedabadgandhinagar-metro-ridership-rises-fourfold-in-three-years/article70519063.ece` (Published January 18, 2026).
6. **The Times of India** — "Ahmedabad: Metro ridership up, earnings stall": `https://timesofindia.indiatimes.com/city/ahmedabad/ahmedabad-metro-ridership-up-earnings-stall/articleshow/126359757.cms` (Published January 07, 2026).
7. **DD News / DD India** — "Gujarat: IPL final drives 66 pc surge in Ahmedabad Metro ridership": `https://ddindia.co.in/2026/06/gujarat-ipl-final-drives-66-pc-surge-in-ahmedabad-metro-ridership/` (Published June 02, 2026).
8. **Gujarat Samachar English** — "Ahmedabad Metro hits record 2.24 lakh passengers amid rickshaw strike": `https://english.gujaratsamachar.com/news/ahmedabad/ahmedabad-metro-hits-record-224-lakh-passengers-amid-rickshaw-strike-91344199817` (Published September 08, 2024).
9. **Gujarat Samachar English** — "Ahmedabad Metro records over 2 lakh passengers on four occasions in August and September": `https://english.gujaratsamachar.com/news/ahmedabad/ahmedabad-metro-records-over-2-lakh-passengers-on-four-occations-in-august-and-september-25896126498` (Published September 20, 2024).
10. **The Indian Express** — "Special tickets, extended daily ops: How Ahmedabad Metro has geared up for World Cup": `https://indianexpress.com/article/cities/ahmedabad/world-cup-2023-special-tickets-world-cup-ticket-rush-england-vs-new-zealand-ahmedabad-metro-8971813/` (Published October 07, 2023).
11. **The Indian Express** — "IPL effect: Record 1.07 lakh passengers rode Ahmedabad Metro on Sunday": `https://indianexpress.com/article/cities/ahmedabad/ipl-effect-record-ahmedabad-metro-sunday-8635119/` (Published May 29, 2023).
12. **GMRC Official Press Release** — "Special Metro Services for Narendra Modi Stadium Cricket Fixtures": `https://www.gujaratmetrorail.com/wp-content/uploads/2025/04/Press-Note-070226-ENG.pdf` (Published February 07, 2026).
13. **IRE Journals** — "Operations Control Centers for Freight, High-Speed, and Metro Rail: Technical Architecture & Systems Engineering": `https://www.irejournals.com/formatedpaper/1719698.pdf` (Published 2024).
14. **Metro Rail News** — "Rolling Stock Manufacturing & Technology: Ahmedabad Metro Rotem Trainsets": `https://metrorailnews.in/self-sufficiency-in-rolling-stock-manufacturing/` (Published October 20, 2023).
15. **General Administration Department (GAD), Government of Gujarat** — Official Public Holiday Gazette: `https://gad.gujarat.gov.in/` (Gazette Notifications 2024, 2025, 2026).
16. **India Meteorological Department (IMD)** — Climatological Table for Ahmedabad Station (1981-2010 Normals): `https://mausam.imd.gov.in/` (Ministry of Earth Sciences, Govt of India).
17. **Gujarat Tourism** — "International Kite Festival (Uttarayan) & Cultural Highlights": `https://www.gujarattourism.com/fairs-festivals/international-kite-festival.html` (Published January 2026).
