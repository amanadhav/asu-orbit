-- Split public contact into structured WhatsApp / Instagram columns.
-- contact_method retained for backwards compatibility (populated on submit).

ALTER TABLE subleases
  ADD COLUMN contact_whatsapp text,
  ADD COLUMN contact_instagram text;

ALTER TABLE listings
  ADD COLUMN contact_whatsapp text,
  ADD COLUMN contact_instagram text;

ALTER TABLE moveout_sales
  ADD COLUMN contact_whatsapp text,
  ADD COLUMN contact_instagram text;
