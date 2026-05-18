-- ============================================================
-- supabase/update-descriptions.sql
--
-- Run this in the Supabase Dashboard → SQL Editor.
-- Corrects addresses, rewrites descriptions with real data,
-- and sets humanised community_notes for apartments with
-- enough resident signal.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- THE LOCAL TEMPE  (rebranded as Alight Tempe)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1900 E Apache Blvd, Tempe, AZ 85281',
  description = 'All-inclusive student community on Apache Blvd, about a 10-minute walk or a quick Metro Valley Rail shuttle ride to campus. Available in 2, 3, and 4-bedroom fully furnished layouts — per-person rates start around $590/month in a 4-bed and go up to $930 in a 2-bed, with Wi-Fi, unlimited electricity, water, and in-unit laundry all bundled in. The building has two pools, a hot tub, a rooftop lounge with fire pits and grills, a 4,000 sq ft gym, a rooftop basketball court, and an on-site convenience store.',
  community_notes = 'Alight comes down to getting what you pay for. At around $655 a month with roommates, it is one of the cheapest options near campus, and for that price point it is genuinely not terrible. The location next to the light rail is legitimately convenient for getting to ASU. Your actual apartment should be decent if you are okay with furnished basics and shared living. Amenities like the gym, pool, and study areas are real perks that actually work.

The real frustration residents mention is management and move-out charges. Multiple people have dealt with surprise fees after move-out that feel like nickel-and-diming for normal wear and tear. The answer is simple but crucial: take photos of everything the moment you get your keys, including existing damage like paint stains or worn areas. Get management to do a walk-through with you on move-in and especially on move-out so charges cannot come out of nowhere later. If you do not document things, they will charge you for stuff that was already broken.

Building conditions vary. Building A tends to have newer furniture if you can request it. Avoid top floors for Wi-Fi since signal gets weaker, and floors 2-4 are better for balancing connectivity with avoiding first-floor noise and hallway smells from the trash valet system. Maintenance will show up for emergencies, though they can be slow on smaller repairs. For international students, confirm upfront how deposits work and get everything in writing since management runs through student staff who can be harder to navigate.

Alight works best if you need cheap rent near campus and do not mind basic conditions or having roommates. Skip it if you want a pristine, quiet living space or value responsive maintenance for small issues.'
WHERE slug = 'the-local-tempe';


-- ────────────────────────────────────────────────────────────
-- HUB ON CAMPUS / UNIVERSITY HOUSE TEMPE
-- (Hub on Campus has been rebranded — University House is the
--  current name at 323 E Veterans Way, directly across from
--  Sun Devil Stadium)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '323 E Veterans Way, Tempe, AZ 85281',
  description = 'Directly across from Sun Devil Stadium on Veterans Way, less than a 3-minute walk to the centre of ASU''s Tempe campus. Offers studio through 5-bedroom fully furnished apartments; per-person rates range from $825/month (5-bed) to $1,609/month (1-bed) for 2026–27, with Wi-Fi and in-unit laundry included. The 40,000 sq ft amenity deck features a resort-style pool, hot tub, volleyball court, 22-foot outdoor LED screen, a 24-hour gym, and clubroom with stadium views. Individual leases mean you are only responsible for your own rent.',
  community_notes = NULL
WHERE slug = 'hub-on-campus-tempe';


-- ────────────────────────────────────────────────────────────
-- UNIVERSITY HOUSE TEMPE
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '323 E Veterans Way, Tempe, AZ 85281',
  description = 'Directly across from Sun Devil Stadium, a 3-minute walk to the heart of ASU''s Tempe campus. Studio through 5-bedroom fully furnished layouts with per-person rates from $825 to $1,609/month for 2026–27 — Wi-Fi and in-unit laundry included. The 40,000 sq ft amenity deck has a resort pool, hot tub, volleyball court, 22-foot outdoor LED screen, and a 24-hour gym. Individual leases so you are only responsible for your own share.',
  community_notes = NULL
WHERE slug = 'university-house-tempe';


-- ────────────────────────────────────────────────────────────
-- IDENTITY TEMPE
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1130 E Lemon St, Tempe, AZ 85281',
  description = 'Modern-finish complex on Lemon St, one block south of the Apache corridor, about a 9-minute walk to campus. Studio, 1-bed, and multi-bed shared units in the $750–1,050 per-person range. Slightly quieter than Apache-facing buildings while still being walkable. Good access to the Rural/Apache Orbit bus stop for trips to Tempe Marketplace and the light rail.',
  community_notes = NULL
WHERE slug = 'identity-tempe';


-- ────────────────────────────────────────────────────────────
-- 922 PLACE
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '922 E Apache Blvd, Tempe, AZ 85281',
  description = 'One of the most affordable options sitting directly on Apache Blvd, about a 5-minute walk to ASU''s engineering side of campus. Older mid-rise with basic amenities — no resort pool, but the location and price are hard to match. Units range from studios to 2-bedrooms in the $620–920/month range. Ask to see the specific unit before signing as condition varies across floors.',
  community_notes = NULL
WHERE slug = '922-place';


-- ────────────────────────────────────────────────────────────
-- VISTA DEL SOL  (ASU-owned)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '701 E Apache Blvd, Tempe, AZ 85281',
  description = 'ASU-owned residential community on the south edge of the Tempe campus, directly across from Barrett Residential Complex. Open exclusively to currently enrolled ASU students — no external applicants. Utilities, cable, and internet are included in semester-based billing ($6,100–$7,100/semester for a shared or private room). The 10-building complex has a 23,000 sq ft community centre with a gym, movie theatre, pool, volleyball and basketball courts, and 24-hour front desk staff. No subleasing allowed under any circumstances.',
  community_notes = NULL
WHERE slug = 'vista-del-sol';


-- ────────────────────────────────────────────────────────────
-- TEMPE METRO APARTMENTS
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1255 E University Dr, Tempe, AZ 85281',
  description = 'Budget-friendly older complex on University Dr, roughly 11 minutes on foot to the main campus. Basic amenities — pool and laundry on-site, no resort-style frills. Rent in the $590–880/month range makes it one of the lower-cost options this close to ASU, which is why it draws a lot of grad students and transfer students watching their costs. Unit condition varies; request to see your specific apartment before signing.',
  community_notes = NULL
WHERE slug = 'tempe-metro-apartments';


-- ────────────────────────────────────────────────────────────
-- UNION TEMPE  (Greystar, 20-story high-rise)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '712 S Forest Ave, Tempe, AZ 85281',
  description = 'Twenty-story high-rise on Forest Ave, less than a 5-minute walk to the centre of ASU''s campus. Opened in 2018 with 407 units across studio to 5-bedroom layouts. Per-person rates start around $889/month; parking is an additional $155/month. Community amenities include a pool, hot tub, fitness centre, dog wash, and clubhouse. Managed by Greystar.',
  community_notes = 'Union Tempe can feel like a good value on the surface, but there are real things you should know before signing. Management quality varies, and residents have reported frustration with unresponsive leadership when things break down, though maintenance itself tends to get repairs done relatively quickly. The big gotcha is electricity. Costs are split building-wide, so even if you conserve energy you are subsidising heavier users. Expect to pay around $65 per person in shared units — not the $15 figure some people hear during tours. Parking is also expensive if you have a car. Deposit experiences are mixed: some residents got full refunds easily, others faced long delays and unresponsive management during move-out, which is particularly stressful for international students who need clear communication about what is being deducted and why.

There have been reports of break-ins and security incidents over the years. Noise depends more on your floor and neighbours than on any building-wide policy. Wi-Fi is generally reliable though it slows during peak evening hours. The location near campus and Mill Avenue is genuinely convenient, and the building itself is physically modern and well-maintained.

Union Tempe works best if you prioritise being steps from campus and are comfortable with a potentially less responsive management experience. It is less ideal if you need clear, reliable communication about fees, deposits, and lease terms — or if you want guarantees that problems get addressed quickly.'
WHERE slug = 'union-tempe';


-- ────────────────────────────────────────────────────────────
-- DISTRICT ON APACHE  (7-story, 279 units)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '977 E Apache Blvd, Tempe, AZ 85281',
  description = 'Seven-story student community on Apache Blvd with 279 fully furnished units across 1, 2, 3, and 4-bedroom layouts. Per-person rates run from roughly $979 to $1,435/month. Amenities include a two-story fitness centre, pool and lazy river, sauna, rooftop lounge, multi-sport simulator, billiard room, and an on-site Shibam Coffee outlet. About a 5-minute walk to the eastern edge of ASU''s main campus. Built 2013. Parking available at $110/month.',
  community_notes = 'District on Apache has a real mixed-bag reputation, and your experience depends a lot on luck and location within the building. The biggest consistent complaint is noise. You will definitely hear parties, and depending on your floor and neighbours, you might hear everything from people talking late at night to bass through the walls. Some residents were fine with it; others said it was unbearable. If you are a light sleeper or need quiet to study, bring earplugs and maybe request a higher floor toward the back of the building, though that is no guarantee. Wi-Fi has been hit or miss, and the apartments themselves tend to be cheaply built with cabinets that do not slide well and obvious touch-up paint jobs.

The real problem area is management and maintenance. Multiple residents report that management was slow to fix things and sometimes tried charging for damage that was already there when they moved in. Document everything carefully during move-in. Move-out experiences vary — some people had hassle-free checkouts while others were hit with unexpected charges. The lease runs a full year from August to August with no early-release option, so if your plans change you are stuck unless you find someone to take over.

On the bright side, the gym and pool are actually nice and worth using, and the location near campus is convenient. The place is expensive for what you get, so compare total costs including utilities and internet before signing. This building works best if you are social and do not mind parties, have a high tolerance for noise, and can afford the premium price.'
WHERE slug = 'district-on-apache';


-- ────────────────────────────────────────────────────────────
-- NEXA APARTMENTS  (Mark-Taylor managed, on Apache)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1221 E Apache Blvd, Tempe, AZ 85281',
  description = 'Modern complex on Apache Blvd with studio through 3-bedroom units, managed by Mark-Taylor. Per-person rates are on the higher end — studios from $1,374/month, 1-beds from $1,519/month, up to $4,130 for a 3-bedroom. Amenities include a resort-style pool and spa with private cabanas, a two-level 24-hour gym with Technogym equipment, a dog park with grooming station, a putting green, and a clubhouse. About a 10-minute walk to ASU''s main campus.',
  community_notes = 'Nexa has gone through real changes, and what you experience there depends heavily on timing and management. The place used to have a solid reputation, but residents have noticed things sliding since the current management took over. You will hear mixed stories — which is honest feedback about a complex that is genuinely inconsistent.

The biggest complaints centre on cleanliness and maintenance responsiveness. Common areas — trash areas, hallways, pool spaces — are frequently described as dirty, with bugs, trash piling up, and poor ventilation near disposal areas. Management tends to be dismissive about complaints and slow to address problems, which is frustrating when you are paying premium rent. Some residents say keeping their own unit spotless helps prevent pest issues, but that should not be your job at this price point. Security is a genuine concern too, with reports of unsecured back entrances — worth asking about directly when you tour.

That said, the apartments themselves can be decent if you get a good unit with a nice view, and amenities like the gym and EV charging are genuinely useful. If you are coming from abroad and signing a lease, pay close attention to move-out procedures and deposit terms upfront, in writing, because management has a reputation for being difficult at lease-end. Nexa works best if you can handle some community-level mess and are the type to advocate loudly for yourself when things go wrong. For international students specifically, clarify all deposit and lease-breaking policies before committing.'
WHERE slug = 'nexa-apartments';


-- ────────────────────────────────────────────────────────────
-- PASEO ON UNIVERSITY  (three pools, bark park)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1255 E University Dr, Tempe, AZ 85281',
  description = 'Sprawling complex on University Dr with studio, 1-bed, and 2-bed units — studios from $1,084/month, 1-beds from $1,052, and 2-beds around $1,310–1,330. Features three resort-style pools and sundecks, a fully equipped gym, study rooms, a game room, a bark park, outdoor grilling stations, and controlled-access entry. About an 11-minute walk to campus. Has multiple building blocks on-site; newer J and I blocks are in noticeably better condition.',
  community_notes = NULL
WHERE slug = 'paseo-on-university';


-- ────────────────────────────────────────────────────────────
-- UNIVERSITY PARK  (garden style, 52 units, pet-free)
-- ────────────────────────────────────────────────────────────
UPDATE apartments SET
  address     = '1023 E University Dr, Tempe, AZ 85281',
  description = 'Garden-style complex with 52 units on University Dr, about a 10-minute walk to ASU''s main campus. Offers 2-bedroom, 2-bathroom apartments at 880 sq ft with a full appliance package, breakfast bar, and private patio. Rent ranges from $1,275 to $1,700/month for the whole unit. Pet-free community. Amenities include a pool, spa, barbecue area, and on-site management. One of the smaller, quieter residential options in the area.',
  community_notes = NULL
WHERE slug = 'university-park';


-- ────────────────────────────────────────────────────────────
-- GATEWAY AT TEMPE  (Greystar, 288 units, sports courts)
-- ────────────────────────────────────────────────────────────
-- Note: Gateway is not in the current seed but community_notes
-- are ready if you add it later.
-- UPDATE apartments SET
--   address     = '1655 E University Dr, Tempe, AZ 85281',
--   description = '...',
--   community_notes = '...'
-- WHERE slug = 'gateway-at-tempe';
