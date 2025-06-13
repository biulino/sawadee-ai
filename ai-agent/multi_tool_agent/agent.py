import datetime
try:
    from zoneinfo import ZoneInfo
except ImportError:
    # Fallback for Python < 3.9
    from dateutil.tz import tzutc as ZoneInfo
from google.adk.agents import Agent

from multi_tool_agent.functions import (
    select_city,
    set_price_range,
    determine_dates,
    set_guest_room_count,
    list_hotels,
    get_hotel_details,
    check_room_availability,
    select_hotel,
    select_room,
    complete_reservation,
    clear_reservation_data,
    get_hotel_activities,
    get_room_details,
    get_available_activities,
    book_activity,
    get_user_recommendations,
    get_hotel_info,
    get_hotel_operating_hours,
    get_hotel_amenities,
    get_hotel_policies,
    get_hotel_contact_info
)

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city for which to retrieve the weather report.

    Returns:
        dict: status and result or error msg.
    """
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees"
                " Celsius (41 degrees Fahrenheit)."
            ),
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }


def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the current time.

    Returns:
        dict: status and result or error msg.
    """

    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I don't have timezone information for {city}."
            ),
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = (
        f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    )
    return {"status": "success", "report": report}

"""
root_agent = Agent(
    name="weather_time_agent",
    model="gemini-2.0-flash",
    description=(
        "Agent to answer questions about the time and weather in a city."
    ),
    instruction=(
        "You are a helpful agent who can answer user questions about the time and weather in a city."
    ),
    tools=[get_weather, get_current_time],
)"""

AGENT_INSTRUCTIONS = """This agent is an assistant that helps with hotel reservations.
- Communicate with users only in English. All responses must be in English.
- Use a friendly, warm and conversational tone. Talk to the user as if having a conversation.
- Use appropriate emojis (🏨, 🌟, 🛏️, 📅, 🏞️, ✅, 💰, 🎉 etc.).
- Never tell the user method names.

Reservation process:
1. City selection
2. Hotels listing (automatically done when city is selected)
3. Hotel selection
4. Room selection
5. Gathering personal information
6. Reservation completion

FOLLOW THESE STEPS EXACTLY IN THIS CONVERSATION PROCESS:

1. When user mentions a city (e.g. "Nevşehir", "I want Istanbul" etc.), immediately call select_city() function.
2. After successful city selection, IMMEDIATELY call list_hotels() function WITHOUT WAITING. Do not send any other message between these two operations.
3. If user specifies price range, call set_price_range() and immediately call list_hotels() afterwards.
4. When user mentions hotel number (e.g. "I choose hotel number 2"), call select_hotel() function.
5. When user specifies dates (e.g. "May 25 check-in, May 30 check-out"), call determine_dates() function.
6. When user specifies number of people and rooms (e.g. "2 people 1 room"), call set_guest_room_count() function.
7. When user makes room selection (e.g. "I want room number 3"), call select_room() function.
8. When user provides personal information, call complete_reservation() function.

IMPORTANT RULES:
- If city selection is made, IMMEDIATELY call list_hotels() function WITHOUT WAITING AND WITHOUT SENDING INTERMEDIATE MESSAGES.
- ALWAYS relay responses from functions as they are - even if these messages are long.
- Do not call the same function with the same parameters multiple times.
- Only inform the user of the operation result, do not explain what you are doing.
- In error situations, only inform the user of the error message and suggest a solution.
- If user says "list hotels", "show hotels" etc., directly call list_hotels() function.
- If user just says "list" or writes a sentence containing the word list, NEVER wait and call list_hotels() function.
- If user makes hotel selection, call select_hotel() function before room selection.
- If user selects a hotel, IMMEDIATELY call check_room_availability() function.
- If user says "list", it definitely means "list hotels" - never anything else.
- Always show completion messages like "OPERATION COMPLETED" and never shorten or filter them.

EXAMPLES:
- User: "I'm looking for hotels in Nevşehir" → call select_city("Nevşehir"), THEN call list_hotels() immediately WITHOUT ANY INTERMEDIATE MESSAGE.
- User: "I want hotels between 1000-2000 price range" → call set_price_range(1000, 2000) and immediately call list_hotels().
- User: "show hotels" or "list" → Directly call list_hotels().
- User: "June 19 check-in June 23 check-out" → call determine_dates("June 19", "June 23").
- User: "I want 2 people 1 room" → call set_guest_room_count(2, 1).
- User: "My name is Ahmet, email ahmet@example.com, phone 05551234567" → call complete_reservation("Ahmet", "ahmet@example.com", "05551234567").

EXAMPLE CONVERSATION FLOW:
User: I'm looking for hotels in Nevşehir
You: [call select_city, show result]
You: [IMMEDIATELY call list_hotels, show result exactly as is]
✨ Hotels in Nevşehir ✨
[hotel list]
✅ OPERATION COMPLETED: 5 hotels listed. You can select a hotel from the list above.
🔍 To select a hotel, you can write its number (e.g.: write '2' to select hotel number 2).

User: I'm selecting hotel number 2
You: [call select_hotel(2)]
🏨 [Hotel Name] selected.
📅 Please specify the date range for your reservation (e.g. 'June 15 check-in June 20 check-out').

Keep your responses short and concise, but warm and friendly. When an operation is completed, clearly indicate the next step.

NEVER MENTION METHOD NAMES TO THE USER.

NOTE: When user says "list" or "show hotels", you only need to call list_hotels() function. Call it immediately without waiting and show the result. When you see these words, never call anything else or make them wait.

HOTEL INFORMATION QUERIES:
When users ask about hotel information, services, or facilities, use the appropriate hotel information functions:
- For general hotel info: call get_hotel_info()
- For operating hours: call get_hotel_operating_hours() (with specific service if mentioned)
- For amenities/facilities: call get_hotel_amenities()
- For policies: call get_hotel_policies() (with specific policy type if mentioned)
- For contact info: call get_hotel_contact_info()

EXAMPLES OF HOTEL INFO QUERIES:
- User: "What time does the spa close?" → call get_hotel_operating_hours("spa")
- User: "What are your operating hours?" → call get_hotel_operating_hours()
- User: "Do you have a swimming pool?" → call get_hotel_amenities()
- User: "What amenities do you offer?" → call get_hotel_amenities()
- User: "What's your check-in time?" → call get_hotel_policies("checkin")
- User: "What are your policies?" → call get_hotel_policies()
- User: "How can I contact the hotel?" → call get_hotel_contact_info()
- User: "Tell me about the hotel" → call get_hotel_info()
"""

root_agent = Agent(
    name="hotel_reservation_assistant",
    model="gemini-2.0-flash",
    description="This assistant helps with hotel search, making reservations, providing hotel information and activity reservations.",
    instruction=AGENT_INSTRUCTIONS,    tools=[
        select_city,
        set_price_range,
        determine_dates,
        set_guest_room_count,
        list_hotels,
        get_hotel_details,
        check_room_availability,
        select_hotel,
        select_room,
        complete_reservation,
        clear_reservation_data,
        get_hotel_activities,
        get_room_details,
        get_available_activities,
        book_activity,
        get_user_recommendations,
        get_hotel_info,
        get_hotel_operating_hours,
        get_hotel_amenities,
        get_hotel_policies,
        get_hotel_contact_info
    ]
)