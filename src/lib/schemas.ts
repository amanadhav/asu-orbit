import { z } from "zod";

export const asuEmail = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .refine(
    (e) => e.toLowerCase().endsWith("@asu.edu"),
    "Must be an @asu.edu email address",
  );

// ── Photo submission ──────────────────────────────────────────
export const photoSchema = z.object({
  apartment_id: z.string().uuid("Please select an apartment"),
  category: z.enum(
    [
      "bedroom",
      "kitchen",
      "bathroom",
      "living",
      "gym",
      "pool",
      "parking",
      "exterior",
      "hallway",
      "other",
    ],
    { error: "Please select a category" },
  ),
  caption: z.string().max(200).optional(),
  submitted_by_email: asuEmail,
});

export type PhotoFormValues = z.infer<typeof photoSchema>;

// ── Review submission ─────────────────────────────────────────
const ratingField = z
  .number({ error: "Please select a rating" })
  .int()
  .min(1, "Rating must be 1-5")
  .max(5, "Rating must be 1-5");

export const reviewSchema = z
  .object({
    apartment_id: z.string().uuid("Please select an apartment"),
    rating_overall: ratingField,
    rating_maintenance: ratingField,
    rating_management: ratingField,
    rating_value: ratingField,
    rating_safety: ratingField,
    // Input type="month" → "YYYY-MM"; stored as "YYYY-MM-01"
    lease_term_start: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format"),
    lease_term_end: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format"),
    review_text: z
      .string()
      .min(50, "Please write at least 50 characters")
      .max(2000, "Maximum 2000 characters"),
    pros: z.string().max(500).optional(),
    cons: z.string().max(500).optional(),
    would_recommend: z.boolean(),
    submitted_by_email: asuEmail,
  })
  .refine(
    (d) => d.lease_term_end >= d.lease_term_start,
    {
      message: "Move-out must be after move-in",
      path: ["lease_term_end"],
    },
  );

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// ── Sublease submission ───────────────────────────────────────
export const SUBLEASE_FURNISHED_VALUES = ["fully", "partial", "unfurnished"] as const;

export const SUBLEASE_AMENITY_OPTIONS = [
  "Fridge",
  "Microwave",
  "Oven",
  "Dishwasher",
  "Washer/Dryer",
  "AC",
  "Parking",
  "WiFi included",
  "Pool access",
  "Gym access",
] as const;
export type SubleaseAmenityId = (typeof SUBLEASE_AMENITY_OPTIONS)[number];

export const subleaseSchema = z
  .object({
    // "directory" mode - pick from known apartments
    apartment_id: z.string().optional(),
    // "custom" mode - type a name
    custom_apartment_name: z.string().max(100).optional(),
    rent_monthly: z
      .number({ error: "Enter a rent amount" })
      .int()
      .min(100, "Rent must be at least $100")
      .max(9999, "Rent seems too high - double-check"),
    utilities_included: z.boolean(),
    available_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    available_until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    gender_preference: z.enum(["male", "female", "any"]),
    room_type: z.enum(["private", "shared"]),
    household_diet: z.enum(["veg", "non_veg", "any"]),
    furnished: z.enum(SUBLEASE_FURNISHED_VALUES, {
      error: "Select furnished status",
    }),
    amenities: z.array(z.enum(SUBLEASE_AMENITY_OPTIONS)),
    move_in_notes: z.string().max(2000).optional(),
    roommate_expectations: z.string().max(2000).optional(),
    contact_whatsapp: z.string().max(120),
    contact_instagram: z.string().max(120),
    additional_info: z.string().max(1000).optional(),
    submitted_by_email: asuEmail,
  })
  .refine(
    (d) =>
      d.contact_whatsapp.trim().length > 0 ||
      d.contact_instagram.trim().length > 0,
    {
      message: "Please provide at least one contact method",
      path: ["contact_whatsapp"],
    },
  )
  .refine(
    (d) => d.available_until > d.available_from,
    {
      message: "End date must be after start date",
      path: ["available_until"],
    },
  )
  .refine(
    (d) =>
      (d.apartment_id && d.apartment_id.length > 0) ||
      (d.custom_apartment_name && d.custom_apartment_name.length > 0),
    {
      message: "Select an apartment or enter a custom complex name",
      path: ["apartment_id"],
    },
  );

export type SubleaseFormValues = z.infer<typeof subleaseSchema>;

// ── Move-out sale submission ───────────────────────────────────
export const ITEM_CATEGORIES = [
  "furniture",
  "kitchen",
  "electronics",
  "bedding",
  "study",
  "decor",
  "clothing",
  "misc",
] as const;

export const ITEM_CONDITIONS = ["new", "like_new", "good", "fair"] as const;

export const moveoutItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Maximum 100 characters"),
  category: z.enum(ITEM_CATEGORIES, { error: "Select a category" }),
  price: z
    .number({ error: "Enter a price (use 0 for free)" })
    .int()
    .min(0, "Price cannot be negative")
    .max(9999, "Price seems too high"),
  condition: z.enum(ITEM_CONDITIONS, { error: "Select a condition" }),
  description: z.string().max(500).optional(),
});

export const moveoutSaleSchema = z
  .object({
    seller_name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Maximum 100 characters"),
    apartment_id: z.string().optional(),
    custom_location: z.string().max(100).optional(),
    moveout_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    contact_whatsapp: z.string().max(120),
    contact_instagram: z.string().max(120),
    additional_info: z.string().max(1000).optional(),
    submitted_by_email: asuEmail,
  })
  .refine(
    (d) =>
      d.contact_whatsapp.trim().length > 0 ||
      d.contact_instagram.trim().length > 0,
    {
      message: "Please provide at least one contact method",
      path: ["contact_whatsapp"],
    },
  )
  .refine(
    (d) =>
      (d.apartment_id && d.apartment_id.length > 0) ||
      (d.custom_location && d.custom_location.length > 0),
    {
      message: "Select an apartment or enter a custom location",
      path: ["apartment_id"],
    },
  );

export type MoveoutItemFormValues = z.infer<typeof moveoutItemSchema>;
export type MoveoutSaleFormValues = z.infer<typeof moveoutSaleSchema>;

// ── Standalone listing submission ─────────────────────────────
export const listingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Maximum 100 characters"),
  category: z.enum(ITEM_CATEGORIES, { error: "Select a category" }),
  price: z
    .number({ error: "Enter a price (use 0 for free)" })
    .int()
    .min(0, "Price cannot be negative")
    .max(9999, "Price seems too high"),
  condition: z.enum(ITEM_CONDITIONS, { error: "Select a condition" }),
  description: z.string().max(500).optional(),
  /** Directory listing - optional; empty means not tied to a complex */
  apartment_id: z.union([z.literal(""), z.string().uuid()]).optional(),
  /** Custom complex when not in directory */
  custom_apartment_name: z.string().max(100).optional(),
  contact_whatsapp: z.string().max(120),
  contact_instagram: z.string().max(120),
  submitted_by_email: asuEmail,
})
  .refine(
    (d) =>
      d.contact_whatsapp.trim().length > 0 ||
      d.contact_instagram.trim().length > 0,
    {
      message: "Please provide at least one contact method",
      path: ["contact_whatsapp"],
    },
  );

export type ListingFormValues = z.infer<typeof listingSchema>;
