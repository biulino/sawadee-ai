# TODO: Add the correct import for @tool decorator
# Example: from google.adk.agents import tool
# or from your_framework import tool

from functions import (select_city, list_hotels, set_price_range, 
                      select_room, determine_dates, complete_reservation)
                      # Note: cancel_reservation function not found in functions.py

@tool
def cancel_reservation_tool(reservation_id: str) -> str:
    """Cancel the reservation with the specified reservation ID.
    
    Args:
        reservation_id: The ID number of the reservation to be cancelled.
    
    Returns:
        Message containing the result of the reservation cancellation process.
    """
    result = cancel_reservation(reservation_id)
    if result["status"] == "success":
        return result["report"]
    else:
        return result["error_message"]