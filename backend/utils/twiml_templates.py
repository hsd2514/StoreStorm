"""
TwiML Templates - XML response generators for Twilio voice calls
Reference: https://www.twilio.com/docs/voice/twiml
"""
from typing import List, Optional
from xml.etree.ElementTree import Element, SubElement, tostring


# Default voice settings
DEFAULT_VOICE = "Polly.Aditi"  # Hindi-English natural voice
DEFAULT_LANGUAGE = "hi-IN"


def _twiml_response() -> Element:
    """Create base TwiML Response element"""
    return Element("Response")


def _say(parent: Element, text: str, voice: str = DEFAULT_VOICE, language: str = DEFAULT_LANGUAGE) -> Element:
    """Add a <Say> element"""
    say = SubElement(parent, "Say", voice=voice, language=language)
    say.text = text
    return say


def _gather(
    parent: Element,
    action: str,
    input_type: str = "speech",
    timeout: int = 5,
    speech_timeout: str = "auto",
    hints: Optional[str] = None
) -> Element:
    """Add a <Gather> element for speech/DTMF input"""
    attrs = {
        "input": input_type,
        "action": action,
        "timeout": str(timeout),
        "speechTimeout": speech_timeout,
    }
    if hints:
        attrs["hints"] = hints
    return SubElement(parent, "Gather", **attrs)


def to_xml(response: Element) -> str:
    """Convert Element to XML string"""
    return '<?xml version="1.0" encoding="UTF-8"?>' + tostring(response, encoding="unicode")


# ============================================================================
# GREETING TEMPLATES
# ============================================================================

def greeting_twiml(shop_name: str, action_url: str = "/twilio/gather") -> str:
    """
    Initial greeting when customer calls.
    Asks what they want to order.
    """
    response = _twiml_response()
    
    gather = _gather(
        response,
        action=action_url,
        input_type="speech",
        timeout=5,
        hints="rice, oil, dal, sugar, wheat, atta, milk, bread"
    )
    
    _say(
        gather,
        f"Namaste! {shop_name} mein aapka swagat hai. "
        f"Aap kya order karna chahenge? Apna order bataiye."
    )
    
    # If no input, prompt again
    _say(response, "Maaf kijiye, mujhe samajh nahi aaya. Kripya dubara bataiye.")
    SubElement(response, "Redirect", method="POST").text = "/twilio/voice"
    
    return to_xml(response)


def greeting_english_twiml(shop_name: str, action_url: str = "/twilio/gather") -> str:
    """English version of greeting"""
    response = _twiml_response()
    
    gather = _gather(
        response,
        action=action_url,
        input_type="speech",
        timeout=5,
        hints="rice, oil, dal, sugar, wheat, flour, milk, bread"
    )
    
    _say(
        gather,
        f"Welcome to {shop_name}! What would you like to order today? "
        f"Please tell me your order.",
        voice="Polly.Raveena",
        language="en-IN"
    )
    
    _say(
        response,
        "Sorry, I didn't catch that. Please try again.",
        voice="Polly.Raveena",
        language="en-IN"
    )
    SubElement(response, "Redirect", method="POST").text = "/twilio/voice"
    
    return to_xml(response)


# ============================================================================
# ORDER CONFIRMATION TEMPLATES
# ============================================================================

def confirm_order_twiml(
    items_summary: str,
    total_amount: float,
    confirm_url: str = "/twilio/confirm"
) -> str:
    """
    Read back the order and ask for confirmation.
    Uses DTMF (keypad) for reliable yes/no.
    """
    response = _twiml_response()
    
    gather = _gather(
        response,
        action=confirm_url,
        input_type="dtmf speech",
        timeout=5,
    )
    
    _say(
        gather,
        f"Aapka order hai: {items_summary}. "
        f"Total amount hai {total_amount:.0f} rupaye. "
        f"Confirm karne ke liye 1 dabayein, ya 'haan' bolein. "
        f"Cancel karne ke liye 2 dabayein, ya 'nahi' bolein."
    )
    
    # No input fallback
    _say(response, "Kripya 1 ya 2 dabayein.")
    SubElement(response, "Redirect", method="POST").text = confirm_url
    
    return to_xml(response)


def confirm_english_twiml(
    items_summary: str,
    total_amount: float,
    confirm_url: str = "/twilio/confirm"
) -> str:
    """English confirmation"""
    response = _twiml_response()
    
    gather = _gather(
        response,
        action=confirm_url,
        input_type="dtmf speech",
        timeout=5,
    )
    
    _say(
        gather,
        f"Your order is: {items_summary}. "
        f"Total amount is {total_amount:.0f} rupees. "
        f"Press 1 or say yes to confirm. "
        f"Press 2 or say no to cancel.",
        voice="Polly.Raveena",
        language="en-IN"
    )
    
    _say(
        response,
        "Please press 1 to confirm or 2 to cancel.",
        voice="Polly.Raveena",
        language="en-IN"
    )
    SubElement(response, "Redirect", method="POST").text = confirm_url
    
    return to_xml(response)


# ============================================================================
# SUCCESS / ERROR TEMPLATES
# ============================================================================

def order_success_twiml(order_number: str) -> str:
    """Order placed successfully"""
    response = _twiml_response()
    
    _say(
        response,
        f"Dhanyavaad! Aapka order confirm ho gaya hai. "
        f"Order number hai {order_number}. "
        f"Aapka order jaldi deliver ho jayega. Namaste!"
    )
    
    SubElement(response, "Hangup")
    return to_xml(response)


def order_cancelled_twiml() -> str:
    """Order cancelled by user"""
    response = _twiml_response()
    
    _say(
        response,
        "Aapka order cancel kar diya gaya hai. "
        "Dubara order karne ke liye call karein. Dhanyavaad!"
    )
    
    SubElement(response, "Hangup")
    return to_xml(response)


def error_twiml(message: str = "Kuch galat ho gaya. Kripya baad mein call karein.") -> str:
    """Generic error response"""
    response = _twiml_response()
    _say(response, message)
    SubElement(response, "Hangup")
    return to_xml(response)


def unmatched_items_twiml(
    unmatched: List[str],
    matched_summary: str,
    retry_url: str = "/twilio/gather"
) -> str:
    """Some items couldn't be found in inventory"""
    response = _twiml_response()
    
    items_text = ", ".join(unmatched)
    
    gather = _gather(response, action=retry_url, input_type="speech", timeout=5)
    
    if matched_summary:
        _say(
            gather,
            f"Maaf kijiye, {items_text} hamare paas nahi hai. "
            f"Lekin {matched_summary} mil gaya. "
            f"Kya aap kuch aur add karna chahenge? Ya 'bas' bolein."
        )
    else:
        _say(
            gather,
            f"Maaf kijiye, {items_text} hamare paas nahi hai. "
            f"Kripya kuch aur bataiye."
        )
    
    _say(response, "Kripya dubara bataiye.")
    SubElement(response, "Redirect", method="POST").text = retry_url
    
    return to_xml(response)


# ============================================================================
# ADDRESS COLLECTION
# ============================================================================

def collect_address_twiml(action_url: str = "/twilio/address") -> str:
    """Ask for delivery address"""
    response = _twiml_response()
    
    gather = _gather(response, action=action_url, input_type="speech", timeout=10)
    
    _say(
        gather,
        "Delivery ke liye aapka address bataiye. "
        "Poora address bolein jaise area, landmark, aur ghar number."
    )
    
    _say(response, "Kripya apna address bataiye.")
    SubElement(response, "Redirect", method="POST").text = action_url
    
    return to_xml(response)
