"""
Utility functions for delivery route calculation
"""
import math
from typing import List, Tuple, Dict

def haversine(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    
    Returns distance in kilometers
    """
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    
    # Convert to radians
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

def nearest_neighbor_route(
    start_point: Tuple[float, float],
    stops: List[Dict]
) -> List[Dict]:
    """
    Simple nearest-neighbor TSP approximation
    
    Args:
        start_point: (longitude, latitude) of shop/depot
        stops: List of dicts with 'latitude' and 'longitude' keys
    
    Returns:
        Ordered list of stops with 'sequence' field added
    """
    if not stops:
        return []
    
    current = start_point
    ordered = []
    remaining = stops.copy()
    sequence = 1
    
    while remaining:
        # Find nearest stop to current position
        nearest = min(
            remaining,
            key=lambda s: haversine(current, (s['longitude'], s['latitude']))
        )
        
        # Add sequence number
        nearest['sequence'] = sequence
        nearest['status'] = 'current' if sequence == 1 else 'pending'
        
        ordered.append(nearest)
        remaining.remove(nearest)
        current = (nearest['longitude'], nearest['latitude'])
        sequence += 1
    
    return ordered

def calculate_total_distance(
    start_point: Tuple[float, float],
    ordered_stops: List[Dict]
) -> float:
    """
    Calculate total route distance in kilometers
    """
    if not ordered_stops:
        return 0.0
    
    total = 0.0
    current = start_point
    
    for stop in ordered_stops:
        next_point = (stop['longitude'], stop['latitude'])
        total += haversine(current, next_point)
        current = next_point
    
    return round(total, 2)

def estimate_delivery_time(distance_km: float, num_stops: int) -> int:
    """
    Estimate delivery time in minutes
    
    Args:
        distance_km: Total distance in kilometers
        num_stops: Number of delivery stops
    
    Returns:
        Estimated time in minutes
    """
    # Assumptions:
    # - Average speed: 25 km/h (urban delivery)
    # - Time per stop: 3 minutes (unload, handoff, confirm)
    
    travel_time = (distance_km / 25) * 60  # Convert to minutes
    stop_time = num_stops * 3
    
    return int(travel_time + stop_time)
