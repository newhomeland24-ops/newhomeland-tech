import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, 
  UploadCloud, 
  Plus, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  Edit3, 
  Building, 
  IndianRupee, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckSquare,
  Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import { compressMediaBatch } from '../../utils/imageCompressor';

const PROPERTY_TYPES = [
  'Apartment', 
  'Villa', 
  'Plot', 
  'Penthouse', 
  'Commercial', 
  'Independent House'
];

const LISTING_TYPES = ['Sale', 'Rent', 'Lease'];
const STATUS_OPTIONS = ['Available', 'Under Offer', 'Sold'];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
const FACING_OPTIONS = ['North', 'East', 'West', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

const AVAILABLE_AMENITIES = [
  'Gated Security',
  '24/7 Water Supply',
  '100% Power Backup',
  'Clubhouse',
  'Swimming Pool',
  'Fitness Center / Gym',
  'EV Charging Station',
  'Children\'s Play Area',
  'High-Speed Elevators',
  'Visitor Parking',
  'Landscaped Gardens',
  'CCTV Surveillance',
  'Jogging Track',
  'Rainwater Harvesting',
  'Intercom Facility',
  'Badminton / Tennis Court'
];

const UploadForm = ({ onSuccess, onCancel, initialData = null }) => {
  const isEditMode = Boolean(initialData);

  // Active Tab: 'basic' | 'specs' | 'location' | 'amenities' | 'media'
  const [activeSection, setActiveSection] = useState('basic');

  // Form State
  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || 'Apartment',
    listingType: initialData?.listingType || 'Sale',
    status: initialData?.status || 'Available',
    // Pricing
    pricing: {
      price: initialData?.pricing?.price !== undefined ? initialData.pricing.price : (initialData?.price !== undefined ? initialData.price : ''),
      priceNegotiable: Boolean(initialData?.pricing?.priceNegotiable ?? initialData?.priceNegotiable),
      maintenanceCharges: initialData?.pricing?.maintenanceCharges ?? 0
    },
    // Specifications
    specifications: {
      bedrooms: initialData?.specifications?.bedrooms ?? 0,
      bathrooms: initialData?.specifications?.bathrooms ?? 0,
      balconies: initialData?.specifications?.balconies ?? 0,
      carpetAreaSqFt: initialData?.specifications?.carpetAreaSqFt ?? (initialData?.area || ''),
      superBuiltUpAreaSqFt: initialData?.specifications?.superBuiltUpAreaSqFt ?? '',
      furnishingStatus: initialData?.specifications?.furnishingStatus || 'Unfurnished',
      facing: initialData?.specifications?.facing || 'East',
      floorNumber: initialData?.specifications?.floorNumber ?? 1,
      totalFloors: initialData?.specifications?.totalFloors ?? 1,
      parkingSlots: initialData?.specifications?.parkingSlots ?? 1,
      ageOfPropertyYears: initialData?.specifications?.ageOfPropertyYears ?? 0
    },
    // Location
    location: {
      address: initialData?.location?.address || (typeof initialData?.location === 'string' ? initialData.location : ''),
      locality: initialData?.location?.locality || '',
      city: initialData?.location?.city || 'Hyderabad',
      state: initialData?.location?.state || 'Telangana',
      pincode: initialData?.location?.pincode || '',
      landmark: initialData?.location?.landmark || ''
    },
    // Amenities
    amenities: Array.isArray(initialData?.amenities) ? initialData.amenities : [],
    // Meta
    meta: {
      isVerified: Boolean(initialData?.meta?.isVerified ?? true),
      featuredPriority: initialData?.meta?.featuredPriority || 0
    },
    // Custom Video URL (e.g. YouTube)
    customVideoUrl: initialData?.media?.videos?.[0]?.url || initialData?.videoUrl || '',
    publishedAt: initialData?.publishedAt 
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  });

  // Media Collections
  const [existingImages, setExistingImages] = useState(
    Array.isArray(initialData?.media?.images) 
      ? initialData.media.images 
      : (Array.isArray(initialData?.images) 
          ? initialData.images.map((img, i) => typeof img === 'string' ? { url: img, publicId: initialData?.cloudinaryPublicIds?.[i] || '', caption: '', isFeatured: i === 0 } : img)
          : [])
  );

  const [existingVideos, setExistingVideos] = useState(
    Array.isArray(initialData?.media?.videos) ? initialData.media.videos : []
  );

  const [existingFloorPlans, setExistingFloorPlans] = useState(
    Array.isArray(initialData?.media?.floorPlans) ? initialData.media.floorPlans : []
  );

  // New selected files to upload
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState([]);
  const [selectedFloorPlanFiles, setSelectedFloorPlanFiles] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic Field Handlers
  const handleTopLevelChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Amenities toggle
  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // File selection handlers
  const handleImageFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...selectedImageFiles, ...newFiles];
      if (combined.length + existingImages.length > 15) {
        toast.error('Maximum 15 photos allowed per listing.');
        setSelectedImageFiles(combined.slice(0, 15 - existingImages.length));
      } else {
        setSelectedImageFiles(combined);
      }
    }
  };

  const handleVideoFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 300 * 1024 * 1024) {
          toast.error('Video must be under 300MB.');
          return;
        }
        setSelectedVideoFiles([file]);
      }
    }
  };

  const handleFloorPlanFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFloorPlanFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  // Remove existing media
  const removeExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingVideo = (idx) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingFloorPlan = (idx) => {
    setExistingFloorPlans(prev => prev.filter((_, i) => i !== idx));
  };

  // Set featured image
  const setFeaturedImage = (idx) => {
    setExistingImages(prev => prev.map((img, i) => ({
      ...img,
      isFeatured: i === idx
    })));
  };

  // Direct backend upload helper
  const uploadFilesToBackend = async (files, category = 'auto') => {
    if (!files || files.length === 0) return [];
    const data = new FormData();
    files.forEach(f => data.append('files', f));

    const res = await axios.post(`/api/properties/admin/upload?category=${category}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          toast.loading(`Uploading ${category} assets (${percent}%)...`, { id: 'upload' });
        }
      }
    });

    return res.data.results || [];
  };

  // Main Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please provide a property title.');
      setActiveSection('basic');
      return;
    }
    if (!formData.pricing.price || Number(formData.pricing.price) <= 0) {
      toast.error('Please provide a valid property price.');
      setActiveSection('pricing');
      return;
    }
    if (!formData.location.locality.trim() || !formData.location.city.trim()) {
      toast.error('Please provide locality and city.');
      setActiveSection('location');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalImages = [...existingImages];
      const finalVideos = [...existingVideos];
      const finalFloorPlans = [...existingFloorPlans];

      // If user pasted a custom YouTube / external video URL
      if (formData.customVideoUrl.trim() && finalVideos.length === 0) {
        finalVideos.push({
          url: formData.customVideoUrl.trim(),
          publicId: 'external_video_url',
          title: 'Walkthrough Video'
        });
      }

      const propertyDataPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || `${formData.title.trim()} located in ${formData.location.locality}, ${formData.location.city}.`,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        status: formData.status,
        pricing: {
          price: Number(formData.pricing.price),
          priceNegotiable: Boolean(formData.pricing.priceNegotiable),
          maintenanceCharges: Number(formData.pricing.maintenanceCharges) || 0
        },
        specifications: {
          bedrooms: Number(formData.specifications.bedrooms) || 0,
          bathrooms: Number(formData.specifications.bathrooms) || 0,
          balconies: Number(formData.specifications.balconies) || 0,
          carpetAreaSqFt: Number(formData.specifications.carpetAreaSqFt) || 0,
          superBuiltUpAreaSqFt: Number(formData.specifications.superBuiltUpAreaSqFt) || 0,
          furnishingStatus: formData.specifications.furnishingStatus,
          facing: formData.specifications.facing,
          floorNumber: Number(formData.specifications.floorNumber) || 0,
          totalFloors: Number(formData.specifications.totalFloors) || 1,
          parkingSlots: Number(formData.specifications.parkingSlots) || 0,
          ageOfPropertyYears: Number(formData.specifications.ageOfPropertyYears) || 0
        },
        location: {
          address: formData.location.address.trim() || `${formData.location.locality}, ${formData.location.city}`,
          locality: formData.location.locality.trim(),
          city: formData.location.city.trim(),
          state: formData.location.state.trim() || 'Telangana',
          pincode: formData.location.pincode.trim(),
          landmark: formData.location.landmark.trim()
        },
        amenities: formData.amenities,
        media: {
          images: finalImages,
          videos: finalVideos,
          floorPlans: finalFloorPlans
        },
        meta: {
          isVerified: Boolean(formData.meta.isVerified),
          featuredPriority: Number(formData.meta.featuredPriority) || 0
        },
        publishedAt: new Date(formData.publishedAt).toISOString(),
        ...(formData.propertyId.trim() ? { propertyId: formData.propertyId.trim().toUpperCase() } : {})
      };

      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(propertyDataPayload));

      if (selectedImageFiles.length > 0) {
        toast.loading('Optimizing image files...', { id: 'upload' });
        const compressed = await compressMediaBatch(selectedImageFiles, (p) => {
          toast.loading(`Optimizing images (${p}%)...`, { id: 'upload' });
        });
        compressed.forEach(file => formDataObj.append('files', file));
      }

      if (selectedVideoFiles.length > 0) {
        selectedVideoFiles.forEach(file => formDataObj.append('files', file));
      }

      if (selectedFloorPlanFiles.length > 0) {
        selectedFloorPlanFiles.forEach(file => formDataObj.append('files', file));
      }

      toast.loading(isEditMode ? 'Updating listing...' : 'Publishing listing...', { id: 'upload' });
      const result = await onSuccess(formDataObj);
      if (result && result.success === false) {
        throw new Error(result.message || 'Failed to save property listing');
      }

      toast.success(isEditMode ? 'Property details updated successfully!' : 'Property listing published successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.dismiss('upload');
      toast.error(error.message || 'Failed to process property listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-form-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div className="upload-form-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #d49a3f 0%, #b87d28 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            {isEditMode ? <Edit3 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {isEditMode ? `Edit Property (${formData.propertyId || 'Listing'})` : 'Create New Real Estate Listing'}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {isEditMode 
                ? 'Update pricing, specifications, amenities, or media assets.'
                : 'Production-ready listing with verified specs, high-res gallery, video, and floor plans.'}
            </p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onCancel} 
          className="modal-close-icon-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', overflowX: 'auto' }}>
        {[
          { id: 'basic', label: '1. Basic Info', icon: Building },
          { id: 'pricing', label: '2. Pricing', icon: IndianRupee },
          { id: 'specs', label: '3. Specifications', icon: Layers },
          { id: 'location', label: '4. Location', icon: MapPin },
          { id: 'amenities', label: '5. Amenities', icon: Sparkles },
          { id: 'media', label: '6. Media Gallery', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.4rem',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#b87d28' : '#64748b',
                borderBottom: isActive ? '3px solid #d49a3f' : '3px solid transparent',
                background: isActive ? '#fffdf7' : 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        {/* TAB 1: BASIC INFO */}
        {activeSection === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Custom Property ID {isEditMode ? '(Locked)' : '(Optional)'}</label>
                <input 
                  type="text" 
                  name="propertyId" 
                  value={formData.propertyId} 
                  onChange={handleTopLevelChange} 
                  disabled={isEditMode}
                  className="form-input" 
                  placeholder="e.g. HYD-10293 or leave blank to auto-generate" 
                  style={{ textTransform: 'uppercase', background: isEditMode ? '#f1f5f9' : '#ffffff' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Property Category *</label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={handleTopLevelChange} 
                  className="form-select"
                >
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input 
                type="text" 
                required 
                name="title" 
                value={formData.title} 
                onChange={handleTopLevelChange} 
                className="form-input" 
                placeholder="e.g. Ultra-Luxury 4 BHK Sky Villa with Private Deck" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <select 
                  name="listingType" 
                  value={formData.listingType} 
                  onChange={handleTopLevelChange} 
                  className="form-select"
                >
                  {LISTING_TYPES.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Status *</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleTopLevelChange} 
                  className="form-select"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Publish Schedule Date</label>
                <input 
                  type="datetime-local" 
                  name="publishedAt" 
                  value={formData.publishedAt} 
                  onChange={handleTopLevelChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Property Overview & Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleTopLevelChange} 
                rows={4} 
                className="form-input" 
                placeholder="Provide comprehensive details about construction quality, views, legal title status, and surrounding infrastructure..." 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="isVerifiedCheckbox"
                checked={formData.meta.isVerified}
                onChange={(e) => handleNestedChange('meta', 'isVerified', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#d49a3f', cursor: 'pointer' }}
              />
              <label htmlFor="isVerifiedCheckbox" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                Mark as Verified Listing (Displays Title Verified badge to buyers)
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING */}
        {activeSection === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Total Price in ₹ (INR) *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={formData.pricing.price} 
                    onChange={(e) => handleNestedChange('pricing', 'price', e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. 15000000 (₹1.50 Cr)" 
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                  {formData.pricing.price ? `Formatted: ₹${Number(formData.pricing.price).toLocaleString('en-IN')}` : 'Enter full numerical price'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Maintenance Charges in ₹</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.pricing.maintenanceCharges} 
                  onChange={(e) => handleNestedChange('pricing', 'maintenanceCharges', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 4500 (0 if inclusive)" 
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input 
                type="checkbox" 
                id="priceNegotiableCheckbox"
                checked={formData.pricing.priceNegotiable}
                onChange={(e) => handleNestedChange('pricing', 'priceNegotiable', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#d49a3f', cursor: 'pointer' }}
              />
              <label htmlFor="priceNegotiableCheckbox" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                Price is Negotiable
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: SPECIFICATIONS */}
        {activeSection === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Bedrooms (BHK)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.bedrooms} 
                  onChange={(e) => handleNestedChange('specifications', 'bedrooms', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 3" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.bathrooms} 
                  onChange={(e) => handleNestedChange('specifications', 'bathrooms', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 3" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Balconies</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.balconies} 
                  onChange={(e) => handleNestedChange('specifications', 'balconies', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 2" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Carpet Area (Sq. Ft) *</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.carpetAreaSqFt} 
                  onChange={(e) => handleNestedChange('specifications', 'carpetAreaSqFt', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 1850" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Super Built-Up Area (Sq. Ft)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.superBuiltUpAreaSqFt} 
                  onChange={(e) => handleNestedChange('specifications', 'superBuiltUpAreaSqFt', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 2400" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Furnishing Status</label>
                <select 
                  value={formData.specifications.furnishingStatus} 
                  onChange={(e) => handleNestedChange('specifications', 'furnishingStatus', e.target.value)} 
                  className="form-select"
                >
                  {FURNISHING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Facing Direction</label>
                <select 
                  value={formData.specifications.facing} 
                  onChange={(e) => handleNestedChange('specifications', 'facing', e.target.value)} 
                  className="form-select"
                >
                  {FACING_OPTIONS.map(fc => <option key={fc} value={fc}>{fc}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Floor Number</label>
                <input 
                  type="number" 
                  value={formData.specifications.floorNumber} 
                  onChange={(e) => handleNestedChange('specifications', 'floorNumber', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 14" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Floors</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.specifications.totalFloors} 
                  onChange={(e) => handleNestedChange('specifications', 'totalFloors', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 28" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parking Slots</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.parkingSlots} 
                  onChange={(e) => handleNestedChange('specifications', 'parkingSlots', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 2" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age of Property (Years)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.specifications.ageOfPropertyYears} 
                  onChange={(e) => handleNestedChange('specifications', 'ageOfPropertyYears', e.target.value)} 
                  className="form-input" 
                  placeholder="0 for New" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOCATION */}
        {activeSection === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div className="form-group">
              <label className="form-label">Street Address / Project Name *</label>
              <input 
                type="text" 
                required 
                value={formData.location.address} 
                onChange={(e) => handleNestedChange('location', 'address', e.target.value)} 
                className="form-input" 
                placeholder="e.g. Tower C, Financial District Residency" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Locality / Neighborhood *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location.locality} 
                  onChange={(e) => handleNestedChange('location', 'locality', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. Gachibowli / Financial District" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location.city} 
                  onChange={(e) => handleNestedChange('location', 'city', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. Hyderabad" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  value={formData.location.state} 
                  onChange={(e) => handleNestedChange('location', 'state', e.target.value)} 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input 
                  type="text" 
                  value={formData.location.pincode} 
                  onChange={(e) => handleNestedChange('location', 'pincode', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. 500032" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prominent Landmark</label>
                <input 
                  type="text" 
                  value={formData.location.landmark} 
                  onChange={(e) => handleNestedChange('location', 'landmark', e.target.value)} 
                  className="form-input" 
                  placeholder="e.g. Near WaveRock SEZ" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AMENITIES */}
        {activeSection === 'amenities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '850px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Select all lifestyle amenities and infrastructure features available for this listing:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <div
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #d49a3f' : '1px solid #e2e8f0',
                      background: isSelected ? '#fffdf7' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none'
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare size={18} color="#d49a3f" />
                    ) : (
                      <Square size={18} color="#94a3b8" />
                    )}
                    <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0f172a' : '#475569' }}>
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA GALLERY */}
        {activeSection === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px' }}>
            {/* 1. Image Gallery */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>High-Resolution Images (Up to 15)</label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Total Images: {existingImages.length + selectedImageFiles.length} / 15
                </span>
              </div>

              <label htmlFor="image-files-upload" className="upload-dropzone">
                <UploadCloud size={36} color="#d49a3f" style={{ marginBottom: '0.4rem' }} />
                <div style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                  <span style={{ color: '#b87d28' }}>Browse images</span> or drag & drop here
                </div>
                <input 
                  id="image-files-upload" 
                  type="file" 
                  style={{ display: 'none' }} 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                />
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
                  Supports JPG, PNG, WEBP with client-side compression
                </p>
              </label>

              {/* Existing Images preview */}
              {existingImages.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Uploaded Images ({existingImages.length}):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                    {existingImages.map((img, i) => (
                      <div 
                        key={i} 
                        style={{
                          position: 'relative',
                          height: '90px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: img.isFeatured ? '2.5px solid #d49a3f' : '1px solid #cbd5e1',
                          background: '#0f172a'
                        }}
                      >
                        <img src={img.url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Featured Badge */}
                        {img.isFeatured ? (
                          <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#d49a3f', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            FEATURED
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFeaturedImage(i)}
                            style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.85)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly selected image chips */}
              {selectedImageFiles.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedImageFiles.map((file, i) => (
                    <div key={i} className="upload-file-chip">
                      <ImageIcon size={14} color="#10b981" />
                      <span className="file-name" title={file.name}>{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="file-remove-btn"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Walkthrough Video */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <label className="form-label">Virtual Walkthrough Video</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <label htmlFor="video-file-upload" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', cursor: 'pointer' }}>
                    <Video size={16} />
                    <span>Upload Video File (MP4, WebM)</span>
                  </label>
                  <input 
                    id="video-file-upload" 
                    type="file" 
                    style={{ display: 'none' }} 
                    accept="video/*" 
                    onChange={handleVideoFileChange} 
                  />
                  {selectedVideoFiles.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      Selected: {selectedVideoFiles[0].name} ({(selectedVideoFiles[0].size / (1024 * 1024)).toFixed(1)} MB)
                    </div>
                  )}
                </div>

                <div>
                  <input 
                    type="url" 
                    value={formData.customVideoUrl} 
                    onChange={(e) => setFormData(prev => ({ ...prev, customVideoUrl: e.target.value }))} 
                    className="form-input" 
                    placeholder="Or paste YouTube / Vimeo link" 
                  />
                </div>
              </div>

              {existingVideos.length > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a' }}>
                    <Video size={16} color="#d49a3f" />
                    <span style={{ fontWeight: 600 }}>Current Cloud Video:</span>
                    <a href={existingVideos[0].url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      View Video Asset
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingVideo(0)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Remove Video
                  </button>
                </div>
              )}
            </div>

            {/* 3. Floor Plans */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <label className="form-label">Floor Plans & Architectural Blueprints</label>
              
              <label htmlFor="floorplan-file-upload" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', padding: '0.65rem 1.25rem', cursor: 'pointer' }}>
                <FileText size={16} />
                <span>Upload Floor Plan Blueprint (Images / PDF)</span>
              </label>
              <input 
                id="floorplan-file-upload" 
                type="file" 
                style={{ display: 'none' }} 
                multiple 
                accept="image/*,application/pdf" 
                onChange={handleFloorPlanFileChange} 
              />

              {existingFloorPlans.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {existingFloorPlans.map((fp, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <FileText size={14} color="#64748b" />
                      <span>{fp.title || `Plan ${i + 1}`}</span>
                      <button type="button" onClick={() => removeExistingFloorPlan(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedFloorPlanFiles.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedFloorPlanFiles.map((file, i) => (
                    <div key={i} className="upload-file-chip">
                      <FileText size={14} color="#3b82f6" />
                      <span className="file-name">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedFloorPlanFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="file-remove-btn"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="upload-form-footer" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="btn btn-outline" 
            style={{ padding: '0.65rem 1.65rem' }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {activeSection !== 'basic' && (
              <button 
                type="button" 
                onClick={() => {
                  const sections = ['basic', 'pricing', 'specs', 'location', 'amenities', 'media'];
                  const currIdx = sections.indexOf(activeSection);
                  if (currIdx > 0) setActiveSection(sections[currIdx - 1]);
                }}
                className="btn btn-outline"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Previous Step
              </button>
            )}

            {activeSection !== 'media' ? (
              <button 
                type="button" 
                onClick={() => {
                  const sections = ['basic', 'pricing', 'specs', 'location', 'amenities', 'media'];
                  const currIdx = sections.indexOf(activeSection);
                  if (currIdx < sections.length - 1) setActiveSection(sections[currIdx + 1]);
                }}
                className="btn btn-dark"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                Next Step
              </button>
            ) : null}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn btn-gold" 
              style={{ padding: '0.65rem 2rem', minWidth: '170px' }}
            >
              {isSubmitting ? (
                <span>Saving Listing...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={16} /> {isEditMode ? 'Update Listing' : 'Publish Listing'}
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
