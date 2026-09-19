const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional().default(''),
  propertyType: z.string().min(1, "Property Type is required"),
  listingType: z.enum(['Sale', 'Rent', 'Lease']).optional().default('Sale'),
  status: z.enum(['Available', 'Sold', 'Draft', 'Under Offer', 'published', 'sold']).optional().default('Available'),
  pricing: z.object({
    price: z.number().nonnegative("Price must be 0 or greater"),
    priceType: z.enum(['Total', 'Per Unit']).optional().default('Total'),
    priceNegotiable: z.boolean().optional().default(false),
    maintenanceCharges: z.number().nonnegative().optional().default(0)
  }).passthrough(),
  specifications: z.object({
    carpetAreaSqFt: z.number().nonnegative().optional().default(0),
    areaUnit: z.string().optional().default(""),
    bhkType: z.string().optional().default("")
  }).passthrough().optional().default({}),
  location: z.object({
    address: z.string().optional().default(''),
    locality: z.string().optional().default(''),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
    landmark: z.string().optional().default(''),
    coordinates: z.object({
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional()
    }).optional()
  }).passthrough(),
  amenities: z.array(z.string()).optional().default([]),
  media: z.object({
    images: z.array(z.any()).optional().default([]),
    videos: z.array(z.any()).optional().default([]),
    floorPlans: z.array(z.any()).optional().default([])
  }).passthrough().optional().default({ images: [], videos: [], floorPlans: [] }),
  meta: z.object({
    isVerified: z.boolean().optional().default(true),
    featuredPriority: z.number().optional().default(0)
  }).passthrough().optional().default({}),
  publishedAt: z.string().optional(),
  propertyId: z.string().optional(),
  customVideoUrl: z.string().optional() // from form data
}).passthrough();

module.exports = {
  propertySchema
};
