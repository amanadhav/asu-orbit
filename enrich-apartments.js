const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleKey = process.env.GOOGLE_STREET_VIEW_API_KEY;

if (!supabaseUrl || !supabaseKey || !googleKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching apartments...");
  const { data: apartments, error } = await supabase.from('apartments').select('*');
  if (error) {
    console.error("Error fetching apartments:", error);
    return;
  }

  console.log(`Found ${apartments.length} apartments to process.`);

  for (const apt of apartments) {
    console.log(`\n--- Processing: ${apt.name} ---`);
    
    // 1. Search for Place ID
    const query = encodeURIComponent(`${apt.name} ${apt.address || 'Tempe, AZ'}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${googleKey}`;
    
    const searchRes = await fetch(searchUrl).then(r => r.json());
    if (!searchRes.candidates || searchRes.candidates.length === 0) {
      console.log(`No Google Place found for ${apt.name}.`);
      continue;
    }
    
    const placeId = searchRes.candidates[0].place_id;
    console.log(`Found Place ID: ${placeId}`);

    // 2. Get Place Details (Photos & Reviews)
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,reviews,rating,user_ratings_total&key=${googleKey}`;
    const detailsRes = await fetch(detailsUrl).then(r => r.json());
    const details = detailsRes.result;

    if (!details) {
      console.log(`Could not fetch details for Place ID ${placeId}`);
      continue;
    }

    // 2.5 Update Apartment with True Google Ratings
    if (details.rating && details.user_ratings_total) {
      const { error: ratingError } = await supabase.from('apartments').update({
        google_rating: details.rating,
        google_reviews_count: details.user_ratings_total
      }).eq('id', apt.id);
      
      if (ratingError) {
        console.error(`Error updating true google rating for ${apt.name}:`, ratingError);
      } else {
        console.log(`Updated true Google Rating: ${details.rating} (${details.user_ratings_total} reviews)`);
      }
    }

    // 3. Process Photos
    let firstPhotoId = null;
    if (details.photos && details.photos.length > 0) {
      const photosToFetch = details.photos.slice(0, 3);
      console.log(`Fetching ${photosToFetch.length} photos...`);
      
      for (const photo of photosToFetch) {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${googleKey}`;
        const imgRes = await fetch(photoUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uuid = crypto.randomUUID();
        const storagePath = `google-places/${apt.slug}/${uuid}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('apartment-photos')
          .upload(storagePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading photo to storage for ${apt.name}:`, uploadError);
          continue;
        }

        const { data: dbPhoto, error: dbError } = await supabase.from('apartment_photos').insert({
          apartment_id: apt.id,
          storage_path: storagePath,
          category: 'exterior',
          caption: 'Google Places Photo',
          submitted_by_email: 'google@system.local',
          verified: true,
          rejected: false
        }).select('id').single();

        if (dbError) {
          console.error(`Error inserting photo to DB for ${apt.name}:`, dbError);
        } else if (!firstPhotoId) {
          firstPhotoId = dbPhoto.id;
        }
      }
      
      // Update cover photo if we successfully downloaded at least one
      if (firstPhotoId) {
        await supabase.from('apartments').update({ cover_photo_id: firstPhotoId }).eq('id', apt.id);
        console.log(`Updated cover photo for ${apt.name}`);
      }
    } else {
      console.log(`No photos found for ${apt.name}.`);
    }

    // 4. Process Reviews
    if (details.reviews && details.reviews.length > 0) {
      console.log(`Processing ${details.reviews.length} reviews...`);
      for (const review of details.reviews) {
        // Skip empty reviews or super short ones
        if (!review.text || review.text.length < 10) continue;

        // Check if we already added a review for this author for this apartment to avoid dupes
        const { data: existing } = await supabase
          .from('apartment_reviews')
          .select('id')
          .eq('apartment_id', apt.id)
          .eq('submitted_by_email', `google-${review.author_name}@system.local`)
          .maybeSingle();

        if (existing) continue; // Skip duplicates if run multiple times

        await supabase.from('apartment_reviews').insert({
          apartment_id: apt.id,
          rating_overall: review.rating,
          rating_maintenance: review.rating,
          rating_management: review.rating,
          rating_value: review.rating,
          rating_safety: review.rating,
          lease_term_start: new Date(review.time * 1000).toISOString(),
          lease_term_end: new Date(review.time * 1000).toISOString(),
          review_text: review.text,
          would_recommend: review.rating >= 4,
          submitted_by_email: `google-${review.author_name}@system.local`,
          verified: true,
          rejected: false,
        });
      }
      console.log(`Inserted reviews for ${apt.name}.`);
    } else {
      console.log(`No reviews found for ${apt.name}.`);
    }
  }

  console.log("\nFinished enrichment!");
}

run().catch(console.error);
