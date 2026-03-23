def calculate_traffic_density(vehicle_count, road_length):
    if road_length == 0:
        return 0
    return vehicle_count / road_length