# MetroPulse Deterministic Action Card Generator
from typing import List
from backend.schemas import ActionCard, EventInput, TimelineMinute
from backend.engine.simulation import format_clock


def generate_action_cards(
    event: EventInput,
    timeline: List[TimelineMinute],
) -> List[ActionCard]:
    """
    Produces 8-12 actionable minute-by-minute operational cards
    for Station Controller, OCC, Security, Platform Staff, and PA Announcers.
    """
    end_time = event.end_time
    actions: List[ActionCard] = []

    # Helper to add card
    def add_card(card_id: str, t_rel: int, owner: str, action: str, reason: str, trigger: str, zone: str, approval: bool = False):
        actions.append(
            ActionCard(
                id=card_id,
                t_rel=t_rel,
                clock=format_clock(end_time, t_rel),
                owner=owner,
                action=action,
                reason=reason,
                trigger=trigger,
                zone=zone,
                requires_approval=approval,
            )
        )

    # 1. Staff Briefing (T-60)
    add_card(
        card_id="ACT-01",
        t_rel=-60,
        owner="Station controller",
        action="Conduct matchday shift briefing and verify radio channels with GRP & security marshals.",
        reason="Ensure unified crowd control protocol and emergency response readiness across all zones.",
        trigger="Time: 60 minutes before scheduled event conclusion.",
        zone="Concourse",
        approval=False,
    )

    # 2. Pre-position standby rakes (T-40)
    add_card(
        card_id="ACT-02",
        t_rel=-40,
        owner="OCC",
        action=f"Power on and pre-position {event.standby_rakes} standby 3-car rakes at Sabarmati & Motera sidings.",
        reason="Enables zero-headway shuttle dispatch immediately when stadium egress begins.",
        trigger="Time: 40 minutes before event conclusion.",
        zone="Mainline",
        approval=True,
    )

    # 3. Reconfigure AFC turnstiles (T-20)
    add_card(
        card_id="ACT-03",
        t_rel=-20,
        owner="Station controller",
        action="Reverse 4 exit gates to dedicated entry mode (14 total entry gates active) and test QR scanners.",
        reason="Maximises ingress capacity to 455 pax/min to absorb initial pre-match departure rush.",
        trigger="Time: 20 minutes prior to final whistle.",
        zone="Gates",
        approval=False,
    )

    # 4. Open forecourt holding pens (T-10)
    add_card(
        card_id="ACT-04",
        t_rel=-10,
        owner="Security",
        action="Deploy barricade pens on footbridge and station forecourt plaza with directional signage.",
        reason="Organises incoming stadium flow into manageable queues before entering concourse.",
        trigger="Time: 10 minutes before event conclusion.",
        zone="Forecourt",
        approval=False,
    )

    # 5. Peak surge begins - Compress headway to 3 min (T+0)
    add_card(
        card_id="ACT-05",
        t_rel=0,
        owner="OCC",
        action="Implement 3-minute mainline headway on North-South corridor and notify all station controllers.",
        reason="Event has concluded; primary mass departure wavefront entering transit corridor.",
        trigger="Event end notification received from stadium control.",
        zone="Mainline",
        approval=True,
    )

    # 6. Concourse holding throttle (T+8)
    add_card(
        card_id="ACT-06",
        t_rel=8,
        owner="Station controller",
        action="Throttle concourse turnstile entry by 85%; hold passengers in concourse and forecourt pens.",
        reason="Platform density approaching 2.0 pax/m² hold threshold; prevents dangerous platform overcrowding.",
        trigger="Condition: Platform density >= 2.0 pax/m².",
        zone="Concourse",
        approval=False,
    )

    # 7. Insert first originating shuttle train (T+14)
    add_card(
        card_id="ACT-07",
        t_rel=14,
        owner="Platform staff",
        action="Dock empty shuttle Rake #1 on Platform Up (Southbound); extend dwell to 60 seconds.",
        reason="Absorbs 382 standing/seated passengers with zero upstream arrival load.",
        trigger="Time: T+14 scheduled peak shuttle insertion.",
        zone="Platform Up",
        approval=True,
    )

    # 8. Release concourse hold in controlled waves (T+22)
    add_card(
        card_id="ACT-08",
        t_rel=22,
        owner="Security",
        action="Release 500 passengers from forecourt pen to concourse gates following train departure.",
        reason="Platform density dropped below 1.5 pax/m² hysteresis recovery threshold.",
        trigger="Condition: Platform density <= 1.5 pax/m².",
        zone="Forecourt",
        approval=False,
    )

    # 9. Insert second empty shuttle train (T+30)
    add_card(
        card_id="ACT-09",
        t_rel=30,
        owner="OCC",
        action="Dispatch shuttle Rake #2 toward Gandhinagar on Platform Down; announce quick boarding.",
        reason="Relieves build-up for northern IT/institutional passengers heading to GNLU/Infocity.",
        trigger="Time: T+30 scheduled peak shuttle insertion.",
        zone="Platform Down",
        approval=True,
    )

    # 10. Ease headway to 4 minutes (T+60)
    add_card(
        card_id="ACT-10",
        t_rel=60,
        owner="OCC",
        action="Transition corridor headway from 3 minutes to 4 minutes; return standby rakes to siding.",
        reason="Primary stadium surge cleared (78% of riders transported); rate of new arrivals tapering.",
        trigger="Time: T+60 15-minute block schedule transition.",
        zone="Mainline",
        approval=False,
    )

    # 11. Revert AFC turnstiles to normal bidirectional configuration (T+90)
    add_card(
        card_id="ACT-11",
        t_rel=90,
        owner="Station controller",
        action="Restore the 4 reversed entry turnstiles to regular exit orientation; dismantle outdoor pens.",
        reason="Station foot traffic transitioning back to standard post-midnight volume.",
        trigger="Condition: Forecourt queue cleared to zero.",
        zone="Gates",
        approval=False,
    )

    # 12. Final line clearance and close-out (T+140)
    add_card(
        card_id="ACT-12",
        t_rel=140,
        owner="Station controller",
        action="Confirm 100% platform clearance, execute station security sweep, and log shift report with OCC.",
        reason="All matchday attendees safely transported; normal overnight maintenance block commences.",
        trigger="Condition: Last passenger boarded; all platform queues cleared.",
        zone="Platform Up",
        approval=False,
    )

    return actions
