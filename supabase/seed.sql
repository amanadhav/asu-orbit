-- ============================================================
-- supabase/seed.sql
-- Addresses and rent ranges verified against official websites
-- and public listing data (May 2026).
-- ============================================================

INSERT INTO apartments (
  name, slug, address,
  distance_to_campus_minutes_walk,
  rent_min, rent_max,
  utilities_typically_included,
  sublease_allowed,
  description
) VALUES

-- 1
(
  'The Local Tempe',
  'the-local-tempe',
  '1900 E Apache Blvd, Tempe, AZ 85281',
  10,
  590, 930,
  true,
  'unknown',
  'All-inclusive student community on the eastern end of Apache Blvd, about a 10-minute walk to campus or a quick Metro Valley Rail shuttle ride. Available in 2, 3, and 4-bedroom fully furnished layouts - per-person rates start around $590/month in a 4-bed and reach $930 in a 2-bed, with Wi-Fi, unlimited electricity, water, and in-unit laundry all bundled in. Amenities include two pools, a hot tub, a rooftop lounge with fire pits, a 4,000 sq ft gym, a rooftop basketball court, and an on-site convenience store.'
),

-- 2
(
  'Hub on Campus Tempe',
  'hub-on-campus-tempe',
  '711 S Forest Ave, Tempe, AZ 85281',
  3,
  889, 1350,
  false,
  'with_approval',
  'One of the closest private student communities to ASU''s main campus - Forest Ave puts you steps from Hayden Library and the Memorial Union. Modern high-rise with studio through 5-bedroom layouts, per-person rates starting around $889/month. Full amenity package including pool, hot tub, fitness centre, and business centre. Sublease typically allowed with management approval. Best suited to students who prioritise a very short walk over keeping costs low.'
),

-- 3
(
  'University House Tempe',
  'university-house-tempe',
  '323 E Veterans Way, Tempe, AZ 85281',
  3,
  825, 1609,
  false,
  'unknown',
  'Directly across the street from Sun Devil Stadium on Veterans Way, less than a 3-minute walk to the centre of campus. Studio through 5-bedroom fully furnished apartments with per-person rates from $825 (5-bed) to $1,609 (1-bed) for 2026-27, with Wi-Fi and in-unit laundry included. The 40,000 sq ft amenity deck features a resort-style pool, hot tub, volleyball court, 22-foot outdoor LED screen, and a 24-hour gym. Individual leases mean you are only responsible for your own rent.'
),

-- 4
(
  'Identity Tempe',
  'identity-tempe',
  '1130 E Lemon St, Tempe, AZ 85281',
  9,
  750, 1050,
  false,
  'unknown',
  'Modern-finish complex one block south of the Apache corridor on Lemon St, roughly a 9-minute walk to campus. Slightly quieter than buildings directly on Apache while staying very walkable. Good access to the Rural/Apache Orbit bus stop for trips to Tempe Marketplace and the light rail. Studio, 1-bedroom, and shared multi-bedroom units available in the $750-1,050 per person range.'
),

-- 5
(
  '922 Place',
  '922-place',
  '922 E Apache Blvd, Tempe, AZ 85281',
  5,
  620, 920,
  false,
  'unknown',
  'One of the most affordable options sitting directly on Apache Blvd, about a 5-minute walk to the engineering side of campus. Older mid-rise with basic amenities - the trade-off is a genuinely prime location at competitive rent. Units range from studios to 2-bedrooms in the $620-920/month range. Condition varies across floors so ask to see the specific unit before signing. Regularly appears in Indian-student sublease listings during summer.'
),

-- 6
(
  'Vista del Sol',
  'vista-del-sol',
  '701 E Apache Blvd, Tempe, AZ 85281',
  5,
  950, 1450,
  true,
  'no',
  'ASU-owned and operated residential community on the south edge of Tempe campus, across from Barrett Residential College. Open exclusively to currently enrolled ASU students - not available through external leasing. Billing is per semester ($6,100-7,100/semester for shared or private rooms in 2026-27), with utilities, cable, and internet included. The 10-building complex has a 23,000 sq ft community centre with a gym, movie theatre, pool, volleyball and basketball courts, and 24-hour front desk staff. No subleasing permitted under any circumstances.'
),

-- 7
(
  'Tempe Metro Apartments',
  'tempe-metro-apartments',
  '1255 E University Dr, Tempe, AZ 85281',
  11,
  590, 880,
  false,
  'unknown',
  'Budget-friendly older complex on University Dr, about an 11-minute walk to ASU''s main campus. Basic amenities - pool and laundry on-site without resort-level frills. Rent is among the lowest available this close to campus, which is why it draws a steady stream of grad students and cost-conscious transfers. Unit condition varies so verify your specific apartment before signing.'
),

-- 8
(
  'Union Tempe',
  'union-tempe',
  '712 S Forest Ave, Tempe, AZ 85281',
  5,
  889, 1760,
  false,
  'unknown',
  'Twenty-story high-rise on Forest Ave, less than a 5-minute walk to the centre of ASU''s campus. Opened in 2018 with 407 units across studio to 5-bedroom layouts - per-person rates start around $889/month. Managed by Greystar. Amenities include a pool, hot tub, fitness centre, dog wash, and business centre. Parking available for $155/month. Note: electricity is billed through a pooled building-wide system, not per unit - ask the leasing office for the actual average monthly charge before signing.'
),

-- 9
(
  'District on Apache',
  'district-on-apache',
  '977 E Apache Blvd, Tempe, AZ 85281',
  8,
  979, 1435,
  false,
  'unknown',
  'Seven-story student community on Apache Blvd with 279 fully furnished units across 1, 2, 3, and 4-bedroom layouts. Per-person rates run from roughly $979 to $1,435/month. Amenities include a two-story fitness centre, pool and lazy river, sauna, multi-sport simulator, billiard room, and an on-site Shibam Coffee outlet. About an 8-minute walk to the eastern edge of campus. Built 2013. Parking available at $110/month. Internet provided through Pavlov Media.'
),

-- 10
(
  'Nexa Apartments',
  'nexa-apartments',
  '1221 E Apache Blvd, Tempe, AZ 85281',
  10,
  1374, 1928,
  false,
  'unknown',
  'Modern complex on Apache Blvd with studio through 3-bedroom apartments, managed by Mark-Taylor. Studios start at $1,374/month and 1-bedrooms at $1,519 - on the higher end of the Apache corridor. Amenities include a resort-style pool and spa with private cabanas, a two-level 24-hour gym with Technogym equipment, a fenced dog park with grooming station, a putting green, and a clubhouse. About a 10-minute walk to campus. Currently offering up to 8-12 weeks free rent on select units.'
),

-- 11
(
  'Paseo on University',
  'paseo-on-university',
  '1255 E University Dr, Tempe, AZ 85281',
  11,
  1052, 1330,
  false,
  'unknown',
  'Sprawling complex on University Dr with studio, 1-bed, and 2-bed units - studios from $1,084/month, 1-beds from $1,052, 2-beds from $1,310. Features three resort-style pools and sundecks, a fully equipped gym, study rooms, a game room, a bark park, outdoor grilling stations, and controlled-access entry. About an 11-minute walk to campus. The complex has multiple building sections - the newer J and I blocks are in noticeably better condition than the older sections.'
),

-- 12
(
  'University Park',
  'university-park',
  '1023 E University Dr, Tempe, AZ 85281',
  10,
  1275, 1700,
  false,
  'unknown',
  'Garden-style complex with 52 units on University Dr, about a 10-minute walk to campus. Offers 2-bedroom, 2-bathroom apartments at 880 sq ft with a full appliance package, breakfast bar, and private patio - rent ranges from $1,275 to $1,700/month for the whole unit. Pet-free community. Amenities include a pool, spa, and barbecue area. One of the smaller, quieter options in the area with approachable on-site management.'
);

