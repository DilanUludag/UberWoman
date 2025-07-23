/*
  # SafeRide Database Schema

  1. New Tables
    - `profiles` - User profiles for both passengers and drivers
    - `rides` - Ride requests and history
    - `driver_locations` - Real-time driver location tracking
    - `safety_events` - Safety incidents and SOS events
    - `vehicles` - Driver vehicle information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on user roles

  3. Functions
    - `nearby_drivers` - Find available drivers within radius
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  avatar_url text,
  is_verified boolean DEFAULT false,
  is_driver boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 5.0,
  total_rides integer DEFAULT 0,
  member_since text DEFAULT to_char(now(), 'Month YYYY'),
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id uuid REFERENCES profiles(id) NOT NULL,
  driver_id uuid REFERENCES profiles(id),
  pickup_address text NOT NULL,
  pickup_latitude numeric(10,8) NOT NULL,
  pickup_longitude numeric(11,8) NOT NULL,
  destination_address text NOT NULL,
  destination_latitude numeric(10,8) NOT NULL,
  destination_longitude numeric(11,8) NOT NULL,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  fare numeric(10,2) NOT NULL,
  distance numeric(10,2) NOT NULL,
  duration integer NOT NULL,
  requested_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  passenger_rating integer CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
  driver_rating integer CHECK (driver_rating >= 1 AND driver_rating <= 5),
  passenger_review text,
  driver_review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Driver locations table
CREATE TABLE IF NOT EXISTS driver_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES profiles(id) NOT NULL,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  heading numeric(5,2) DEFAULT 0,
  is_available boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Safety events table
CREATE TABLE IF NOT EXISTS safety_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  ride_id uuid REFERENCES rides(id),
  event_type text NOT NULL CHECK (event_type IN ('sos', 'panic', 'route_deviation', 'emergency_contact', 'location_share')),
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  description text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES profiles(id) NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text NOT NULL,
  license_plate text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Rides policies
CREATE POLICY "Users can read own rides"
  ON rides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

CREATE POLICY "Passengers can create rides"
  ON rides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update rides"
  ON rides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id OR auth.uid() = passenger_id);

-- Driver locations policies
CREATE POLICY "Drivers can manage own location"
  ON driver_locations
  FOR ALL
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Users can read driver locations"
  ON driver_locations
  FOR SELECT
  TO authenticated
  USING (true);

-- Safety events policies
CREATE POLICY "Users can manage own safety events"
  ON safety_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Vehicles policies
CREATE POLICY "Drivers can manage own vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (auth.uid() = driver_id);

-- Function to find nearby drivers
CREATE OR REPLACE FUNCTION nearby_drivers(lat numeric, lng numeric, radius_km numeric DEFAULT 10)
RETURNS TABLE (
  driver_id uuid,
  full_name text,
  rating numeric,
  latitude numeric,
  longitude numeric,
  distance_km numeric,
  vehicle_info text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.driver_id,
    p.full_name,
    p.rating,
    dl.latitude,
    dl.longitude,
    (6371 * acos(cos(radians(lat)) * cos(radians(dl.latitude)) * cos(radians(dl.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(dl.latitude)))) as distance_km,
    CONCAT(v.year, ' ', v.make, ' ', v.model, ' - ', v.color) as vehicle_info
  FROM driver_locations dl
  JOIN profiles p ON p.id = dl.driver_id
  LEFT JOIN vehicles v ON v.driver_id = dl.driver_id
  WHERE 
    dl.is_available = true
    AND p.is_driver = true
    AND p.is_verified = true
    AND (6371 * acos(cos(radians(lat)) * cos(radians(dl.latitude)) * cos(radians(dl.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(dl.latitude)))) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_locations_available ON driver_locations(is_available, driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides(passenger_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_safety_events_user ON safety_events(user_id, created_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();