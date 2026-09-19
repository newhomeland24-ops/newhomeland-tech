const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  propertyType: z.string().min(1, "Property Type is required"),
  listingType: z.enum(['Sale', 'Rent', 'Lease']),
  status: z.enum(['Available', 'Sold', 'Draft']),
  pricing: z.object({
    price: z.number().nonnegative("Price must be 0 or greater"),
    priceType: z.enum(['Total', 'Per Unit']),
    priceNegotiable: z.boolean().optional().default(false),
    maintenanceCharges: z.number().nonnegative().optional().default(0)
  }),
  specifications: z.object({
    carpetAreaSqFt: z.number().nonnegative().optional().default(0),
    areaUnit: z.string().optional().default(""),
    bhkType: z.string().optional().default("")
  }).optional(),
  location: z.object({
    address: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required"),
    landmark: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),
  amenities: z.array(z.string()).optional(),
  meta: z.object({
    isVerified: z.boolean().optional().default(true),
    featuredPriority: z.number().optional().default(0)
  }).optional(),
  publishedAt: z.string().optional(),
  propertyId: z.string().optional(),
  customVideoUrl: z.string().optional() // from form data
});

module.exports = {
  propertySchema
};
