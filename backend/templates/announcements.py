# MetroPulse Multilingual Announcement Templates (Offline Fallback)
from typing import Dict, List, Any
from backend.schemas import AnnouncementItem


TEMPLATES: Dict[str, Dict[str, str]] = {
    "pre_event": {
        "name": "Pre-event Matchday Advisory",
        "t_rel": -30,
        "en": "Welcome to {station} Metro Station. For your convenience, special return trains will run every {headway} minutes after the event until {end_train_time}. Please keep your QR ticket or smart card ready for smooth entry.",
        "gu": "{station} મેટ્રો સ્ટેશન પર આપનું સ્વાગત છે. તમારી સુવિધા માટે, કાર્યક્રમ પછી રાત્રે {end_train_time} વાગ્યા સુધી દર {headway} મિનિટે ખાસ મેટ્રો ટ્રેનો દોડશે. ઝડપી પ્રવેશ માટે કૃપા કરીને તમારી ક્યૂઆર ટિકિટ અથવા સ્માર્ટ કાર્ડ તૈયાર રાખો.",
        "hi": "{station} मेट्रो स्टेशन में आपका स्वागत है। आपकी सुविधा के लिए, कार्यक्रम के बाद रात {end_train_time} बजे तक हर {headway} मिनट में विशेष ट्रेनें चलेंगी। त्वरित प्रवेश के लिए कृपया अपना क्यूआर टिकट या स्मार्ट कार्ड तैयार रखें।",
    },
    "entry_gates": {
        "name": "Automated Entry Gates Opening",
        "t_rel": -15,
        "en": "Attention passengers: All {gate_count} automated entry gates are now open. Passengers holding matchday QR tickets may proceed through any green lane. Please follow security marshal directions.",
        "gu": "ધ્યાન આપો યાત્રીઓ: તમામ {gate_count} ઓટોમેટેડ પ્રવેશ ગેટ હવે ખુલ્લા છે. ઇવેન્ટ ક્યૂઆર ટિકિટ ધરાવતા મુસાફરો કોઈપણ લીલી લેનમાંથી ઝડપથી પ્રવેશી શકે છે. કૃપા કરીને સુરક્ષા કર્મીઓના નિર્દેશોનું પાલન કરો.",
        "hi": "यात्रीगण ध्यान दें: सभी {gate_count} स्वचालित प्रवेश गेट अब खुले हैं। इवेंट क्यूआर टिकट धारक किसी भी हरी लेन से तुरंत प्रवेश कर सकते हैं। कृपया सुरक्षा कर्मियों के निर्देशों का पालन करें।",
    },
    "hold_forecourt": {
        "name": "Concourse Hold & Safe Metering",
        "t_rel": 10,
        "en": "Passengers please note: Platform entry is temporarily regulated for your safety while boarding completes. Please remain comfortably in the forecourt holding area. Turnstiles will reopen shortly. Thank you for your cooperation.",
        "gu": "મુસાફરો કૃપા કરીને નોંધ લો: પ્લેટફોર્મની સુરક્ષા જાળવવા પ્રવેશ થોડા સમય માટે નિયંત્રિત કરવામાં આવ્યો છે. કૃપા કરીને હોલ્ડિંગ એરિયામાં શાંતિથી રાહ જુઓ. ગેટ ટૂંક સમયમાં ફરી ખુલશે. આપના સહકાર બદલ આભાર.",
        "hi": "यात्रीगण कृपया ध्यान दें: सुरक्षित यात्रा के लिए प्लेटफॉर्म में प्रवेश को कुछ समय के लिए नियंत्रित किया गया है। कृपया होल्डिंग एरिया में धैर्यपूर्वक प्रतीक्षा करें। गेट शीघ्र ही पुनः खुलेंगे। आपके सहयोग के लिए धन्यवाद।",
    },
    "extra_trains": {
        "name": "Special Empty Shuttle Insertion",
        "t_rel": 20,
        "en": "Special empty shuttle train is now berthing on Platform 1 for APMC and Old High Court. High-frequency trains are departing every {headway} minutes. Please board across all coaches and let alighting passengers pass first.",
        "gu": "એ.પી.એમ.સી. અને જૂની હાઈકોર્ટ તરફ જતી વિશેષ ખાલી શટલ ટ્રેન પ્લેટફોર્મ 1 પર આવી રહી છે. દર {headway} મિનિટે ટ્રેન દોડી રહી છે. કૃપા કરીને તમામ કોચમાં સમાન રીતે સવાર થાઓ.",
        "hi": "एपीएमसी और पुरानी हाईकोर्ट की ओर जाने वाली विशेष खाली शटल ट्रेन प्लेटफॉर्म 1 पर आ रही है। ट्रेनें हर {headway} मिनट में रवाना हो रही हैं। कृपया सभी डिब्बों में समान रूप से सवार हों।",
    },
    "platform_crowding": {
        "name": "Platform Safe Marshalling",
        "t_rel": 35,
        "en": "Please spread out along the entire platform length and stay strictly behind the yellow tactile safety line. Do not obstruct platform screen doors. The next train arrives in under 3 minutes.",
        "gu": "કૃપા કરીને પ્લેટફોર્મ પર સમગ્ર લંબાઈમાં ફેલાઈ જાવ અને પીળી સુરક્ષા રેખાની પાછળ ઉભા રહો. પ્લેટફોર્મ સ્ક્રીન દરવાજામાં અવરોધ ન કરો. આગામી ટ્રેન 3 મિનિટથી ઓછા સમયમાં આવી રહી છે.",
        "hi": "कृपया प्लेटफॉर्म की पूरी लंबाई में फैल जाएं और पीली सुरक्षा रेखा के पीछे ही खड़े रहें। प्लेटफॉर्म स्क्रीन दरवाजों में बाधा न डालें। अगली ट्रेन 3 मिनट में आ रही है।",
    },
    "last_trains": {
        "name": "Last Connecting Train Advisory",
        "t_rel": 90,
        "en": "Final departure reminder: The last connecting revenue trains across both Red and Yellow lines will depart at {end_train_time}. Passengers in the concourse are advised to proceed to platforms now.",
        "gu": "છેલ્લી ટ્રેન રીમાઇન્ડર: રેડ અને યલો બંને લાઈનો પર છેલ્લી કનેક્ટિંગ ટ્રેનો રાત્રે {end_train_time} વાગ્યે રવાના થશે. કોનકોર્સ પરના મુસાફરોને તરત જ પ્લેટફોર્મ પર જવા વિનંતી છે.",
        "hi": "अंतिम ट्रेन स्मरण पत्र: रेड और येलो दोनों लाइनों की अंतिम कनेक्टिंग ट्रेनें रात {end_train_time} बजे रवाना होंगी। कॉनकोर्स में मौजूद यात्री कृपया तुरंत प्लेटफॉर्म पर जाएं।",
    },
    "all_clear": {
        "name": "Surge Clearance Complete (All-Clear)",
        "t_rel": 130,
        "en": "Stadium crowd egress is now successfully completed. Normal overnight operations have resumed. Morning metro services will commence at 06:20 AM tomorrow. Thank you for travelling with Gujarat Metro Rail.",
        "gu": "સ્ટેડિયમ મુસાફરોની રવાનગી સફળતાપૂર્વક પૂર્ણ થઈ છે. નિયમિત રાત્રિ કામગીરી શરૂ થઈ ગઈ છે. સવારની મેટ્રો સેવાઓ આવતીકાલે 06:20 વાગ્યે શરૂ થશે. ગુજરાત મેટ્રો સાથે મુસાફરી કરવા બદલ આભાર.",
        "hi": "स्टेडियम यात्रियों की निकासी सफलतापूर्वक संपन्न हो गई है। रात्रि संचालन पुनः सामान्य हो गया है। सुबह की मेट्रो सेवाएं कल 06:20 बजे शुरू होंगी। गुजरात मेट्रो से यात्रा करने के लिए धन्यवाद।",
    },
}


def get_template_announcements(
    event_name: str,
    station_name: str = "Motera Stadium",
    headway_min: int = 3,
    end_train_time: str = "01:30 AM",
    gate_count: int = 14,
    source: str = "template",
) -> List[AnnouncementItem]:
    """Generates localized announcement cards with templated text."""
    items: List[AnnouncementItem] = []
    for moment_id, data in TEMPLATES.items():
        params = {
            "station": station_name,
            "headway": headway_min,
            "end_train_time": end_train_time,
            "gate_count": gate_count,
            "event": event_name,
        }
        en_text = data["en"].format(**params)
        gu_text = data["gu"].format(**params)
        hi_text = data["hi"].format(**params)

        items.append(
            AnnouncementItem(
                moment_id=moment_id,
                moment_name=data["name"],
                t_rel=data["t_rel"],
                clock="23:30",  # dynamically adjusted in caller
                en=en_text,
                gu=gu_text,
                hi=hi_text,
                source=source,
                is_draft=(source == "llm"),
            )
        )
    return items
