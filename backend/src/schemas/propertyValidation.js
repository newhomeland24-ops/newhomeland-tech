const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  propertyType: z.enum(['Residential', 'Commercial', 'Agricultural', 'Industrial']),
  listingType: z.enum(['Sale', 'Rent', 'Lease']),
  status: z.enum(['Available', 'Sold', 'Draft']),
  pricing: z.object({
    price: z.number().nonnegative("Price must be 0 or greater"),
    priceNegotiable: z.boolean().optional().default(false),
    maintenanceCharges: z.number().nonnegative().optional().default(0)
  }),
  specifications: z.object({
    bedrooms: z.number().nonnegative().optional().default(0),
    bathrooms: z.number().nonnegative().optional().default(0),
    balconies: z.number().nonnegative().optional().default(0),
    carpetAreaSqFt: z.number().nonnegative().optional().default(0),
    superBuiltUpAreaSqFt: z.number().nonnegative().optional().default(0),
    furnishingStatus: z.string().optional(),
    facing: z.string().optional(),
    floorNumber: z.number().optional().default(0),
    totalFloors: z.number().optional().default(1),
    parkingSlots: z.number().nonnegative().optional().default(0),
    ageOfPropertyYears: z.number().nonnegative().optional().default(0)
  }).optional(),
  location: z.object({
    address: z.string().optional(),
    locality: z.string().min(1, "Locality is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional().default("Telangana"),
    pincode: z.string().optional(),
    landmark: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),
  amenities: z.array(z.string()).optional(),
  meta: z.object({
    isVerified: z.boolean().optional().default(false),
    featuredPriority: z.number().optional().default(0)
  }).optional(),
  publishedAt: z.string().optional(),
  propertyId: z.string().optional(),
  customVideoUrl: z.string().optional() // from form data
});

module.exports = {
  propertySchema
};
