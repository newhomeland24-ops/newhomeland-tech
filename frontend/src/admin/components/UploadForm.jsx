import React, { useState, useEffect, useRef } from 'react';
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
import { useSettings } from '../../context/SettingsContext';

const LISTING_TYPES = ['Sale', 'Rent', 'Lease'];
const STATUS_OPTIONS = ['Available', 'Under Offer', 'Sold'];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
const FACING_OPTIONS = ['North', 'East', 'West', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];



const UploadForm = ({ onSuccess, onCancel, initialData = null }) => {
  const isEditMode = Boolean(initialData);
  const { settings } = useSettings(); // Keeping useSettings in case it's used elsewhere, but not for propertyTypes
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [areaUnits, setAreaUnits] = useState([]);

  const [availableAmenities, setAvailableAmenities] = useState([]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const res = await axios.get('/api/properties/admin/types', { withCredentials: true });
        if (res.data.success) {
          setPropertyTypes(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch property types:', error);
      }
    };
    
    const fetchAreaUnits = async () => {
      try {
        const res = await axios.get('/api/properties/admin/units', { withCredentials: true });
        if (res.data.success) {
          setAreaUnits(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch area units:', error);
      }
    };

    const fetchAmenities = async () => {
      try {
        const res = await axios.get('/api/properties/admin/amenities', { withCredentials: true });
        if (res.data.success) {
          setAvailableAmenities(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch amenities:', error);
      }
    };
    
    fetchPropertyTypes();
    fetchAreaUnits();
    fetchAmenities();
  }, []);

  const [isAddingType, setIsAddingType] = useState(false);
  const [newPropertyType, setNewPropertyType] = useState('');

  const handleAddPropertyType = async () => {
    let trimmedType = newPropertyType.trim();
    if (!trimmedType) {
      setIsAddingType(false);
      return;
    }
    
    // Capitalize the first letter
    const formattedType = trimmedType.charAt(0).toUpperCase() + trimmedType.slice(1);

    if (!propertyTypes.includes(formattedType)) {
      setPropertyTypes(prev => [...prev, formattedType].sort());
      toast.success('Property category applied! It will be saved permanently once the property is published.');
    }
    
    setFormData(prev => ({ ...prev, propertyType: formattedType }));
    setIsAddingType(false);
    setNewPropertyType('');
  };

  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newAreaUnit, setNewAreaUnit] = useState('');

  const handleAddAreaUnit = async () => {
    let trimmedUnit = newAreaUnit.trim();
    if (!trimmedUnit) {
      setIsAddingUnit(false);
      return;
    }
    
    const formattedUnit = trimmedUnit.charAt(0).toUpperCase() + trimmedUnit.slice(1);

    if (!areaUnits.includes(formattedUnit)) {
      const newUnits = [...areaUnits, formattedUnit].sort();
      setAreaUnits(newUnits);
      try {
        await axios.put('/api/settings', { areaUnits: newUnits }, { withCredentials: true });
        toast.success('New area unit saved permanently!');
      } catch (err) {
        console.error('Failed to save area unit permanently:', err);
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      specifications: { ...prev.specifications, areaUnit: formattedUnit }
    }));
    setIsAddingUnit(false);
    setNewAreaUnit('');
  };

  const [isAddingAmenity, setIsAddingAmenity] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  const handleAddAmenity = async () => {
    let trimmedAmenity = newAmenity.trim();
    if (!trimmedAmenity) {
      setIsAddingAmenity(false);
      return;
    }
    
    const formattedAmenity = trimmedAmenity.charAt(0).toUpperCase() + trimmedAmenity.slice(1);

    if (!availableAmenities.includes(formattedAmenity)) {
      const newAmenitiesList = [...availableAmenities, formattedAmenity].sort();
      setAvailableAmenities(newAmenitiesList);
      try {
        await axios.put('/api/settings', { amenities: newAmenitiesList }, { withCredentials: true });
        toast.success('New amenity saved permanently!');
      } catch (err) {
        console.error('Failed to save amenity permanently:', err);
      }
    }
    
    // Automatically select the newly added amenity
    if (!formData.amenities.includes(formattedAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, formattedAmenity]
      }));
    }
    
    setIsAddingAmenity(false);
    setNewAmenity('');
  };

  // Form State
  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || '',
    listingType: initialData?.listingType || '',
    status: initialData?.status || 'Available',
    // Pricing
    pricing: {
      price: initialData?.pricing?.price !== undefined ? initialData.pricing.price : (initialData?.price !== undefined ? initialData.price : ''),
      priceType: initialData?.pricing?.priceType || 'Total',
      priceNegotiable: Boolean(initialData?.pricing?.priceNegotiable ?? initialData?.priceNegotiable),
      maintenanceCharges: initialData?.pricing?.maintenanceCharges ?? 0
    },
    // Specifications
    specifications: {
      carpetAreaSqFt: initialData?.specifications?.carpetAreaSqFt ?? (initialData?.area || ''),
      areaUnit: initialData?.specifications?.areaUnit || '',
      bhkType: initialData?.specifications?.bhkType || ''
    },
    // Location
    location: {
      address: initialData?.location?.address || (typeof initialData?.location === 'string' ? initialData.location : ''),
      locality: initialData?.location?.locality || '',
      city: initialData?.location?.city || '',
      state: initialData?.location?.state || '',
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

  const lastFetchedPincode = useRef(initialData?.location?.pincode || '');

  // Pincode Autofill Effect (runs only when user enters a new pincode, never on initial edit load)
  useEffect(() => {
    const pincode = formData.location.pincode;
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return;
    }

    // Do not re-fetch or show popups for existing saved pincode when editing
    if (pincode === lastFetchedPincode.current) {
      return;
    }

    const fetchLocationDetails = async () => {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              state: postOffice.State || prev.location.state,
              city: postOffice.District || postOffice.Circle || prev.location.city,
            }
          }));
          lastFetchedPincode.current = pincode;
          toast.success('Location details auto-filled from Pincode!');
        }
      } catch (error) {
        console.error("Pincode fetch error:", error);
      }
    };
    
    fetchLocationDetails();
  }, [formData.location.pincode]);

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
  const handleMediaFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const newImages = newFiles.filter(f => f.type.startsWith('image/'));
      const newVideos = newFiles.filter(f => f.type.startsWith('video/'));

      const currentImages = existingImages.length + selectedImageFiles.length;
      const currentVideos = existingVideos.length + selectedVideoFiles.length;

      let imagesToAdd = newImages;
      let videosToAdd = newVideos;

      if (currentImages + newImages.length > 4) {
        toast.error('Maximum 4 images allowed per listing.');
        const remainingImages = Math.max(0, 4 - currentImages);
        imagesToAdd = newImages.slice(0, remainingImages);
      }

      if (currentVideos + newVideos.length > 2) {
        toast.error('Maximum 2 videos allowed per listing.');
        const remainingVideos = Math.max(0, 2 - currentVideos);
        videosToAdd = newVideos.slice(0, remainingVideos);
      }

      if (imagesToAdd.length > 0) {
        setSelectedImageFiles(prev => [...prev, ...imagesToAdd]);
      }
      if (videosToAdd.length > 0) {
        setSelectedVideoFiles(prev => [...prev, ...videosToAdd]);
      }
    }
  };

  const handleFloorPlanFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentTotal = existingFloorPlans.length + selectedFloorPlanFiles.length;
      if (currentTotal + newFiles.length > 3) {
        toast.error('Maximum 3 floor plan files allowed per listing.');
        const remaining = Math.max(0, 3 - currentTotal);
        if (remaining > 0) {
          setSelectedFloorPlanFiles(prev => [...prev, ...newFiles.slice(0, remaining)]);
        }
      } else {
        setSelectedFloorPlanFiles(prev => [...prev, ...newFiles]);
      }
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

    if (!formData.propertyType) {
      toast.error('Please select a property category.');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please provide a property title.');
      return;
    }
    if (!formData.pricing.price || Number(formData.pricing.price) <= 0) {
      toast.error('Please provide a valid property price.');
      return;
    }
    if (!formData.location.locality.trim() || !formData.location.city.trim()) {
      toast.error('Please provide locality and city.');
      return;
    }
    if (existingImages.length + selectedImageFiles.length + existingVideos.length + selectedVideoFiles.length === 0) {
      toast.error('Please upload at least one image or video in High-Resolution Media.');
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
        description: formData.description.trim() || `${formData.title.trim()} located in ${[formData.location.locality, formData.location.city].filter(Boolean).join(', ')}.`,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        status: formData.status,
        pricing: {
          price: Number(formData.pricing.price),
          priceType: formData.pricing.priceType || 'Total',
          priceNegotiable: Boolean(formData.pricing.priceNegotiable),
          maintenanceCharges: Number(formData.pricing.maintenanceCharges) || 0
        },
        specifications: {
          bedrooms: Number(formData.specifications.bedrooms) || 0,
          bathrooms: Number(formData.specifications.bathrooms) || 0,
          balconies: Number(formData.specifications.balconies) || 0,
          carpetAreaSqFt: Number(formData.specifications.carpetAreaSqFt) || 0,
          superBuiltUpAreaSqFt: Number(formData.specifications.superBuiltUpAreaSqFt) || 0,
          areaUnit: formData.specifications.areaUnit || '',
          bhkType: formData.specifications.bhkType || '',
          furnishingStatus: formData.specifications.furnishingStatus,
          facing: formData.specifications.facing,
          floorNumber: Number(formData.specifications.floorNumber) || 0,
          totalFloors: Number(formData.specifications.totalFloors) || 1,
          parkingSlots: Number(formData.specifications.parkingSlots) || 0,
          ageOfPropertyYears: Number(formData.specifications.ageOfPropertyYears) || 0
        },
        location: {
          address: formData.location.address.trim() || [formData.location.locality, formData.location.city].filter(Boolean).join(', ') || formData.location.city.trim(),
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
        selectedImageFiles.forEach(file => formDataObj.append('images', file));
      }

      if (selectedVideoFiles.length > 0) {
        selectedVideoFiles.forEach(file => formDataObj.append('videos', file));
      }

      if (selectedFloorPlanFiles.length > 0) {
        selectedFloorPlanFiles.forEach(file => formDataObj.append('floorPlans', file));
      }

      const totalFilesCount = selectedImageFiles.length + selectedVideoFiles.length + selectedFloorPlanFiles.length;
      toast.loading(isEditMode ? 'Updating listing...' : 'Publishing listing...', { id: 'upload' });

      const onProgress = (percent) => {
        if (totalFilesCount > 0) {
          if (percent < 100) {
            toast.loading(`Uploading ${totalFilesCount} media file${totalFilesCount > 1 ? 's' : ''} (${percent}%)...`, { id: 'upload' });
          } else {
            toast.loading('Processing on Cloudinary & saving listing...', { id: 'upload' });
          }
        } else {
          toast.loading('Saving property details...', { id: 'upload' });
        }
      };

      const result = await onSuccess(formDataObj, onProgress);
      if (result && result.success === false) {
        throw new Error(result.message || 'Failed to save property listing');
      }

      toast.success(isEditMode ? 'Property details updated successfully!' : 'Property listing published successfully!', { id: 'upload' });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to process property listing', { id: 'upload' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-form-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <style>{`
        .upload-form-card .form-group {
          margin-bottom: 0 !important;
        }
      `}</style>
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
                : 'Enter comprehensive property details, pricing, and high-resolution media to publish a new listing.'}
            </p>
          </div>
        </div>

      </div>



      {/* Form Content */}
      <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        {/* SECTION 1: BASIC INFO */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>1. Basic Info</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Property Category *</label>
              {isAddingType ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value)}
                    className="form-input"
                    placeholder="Enter new property type..."
                    autoFocus
                  />
                  <button type="button" className="btn btn-dark" onClick={handleAddPropertyType}>Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => setIsAddingType(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    name="propertyType" 
                    value={formData.propertyType} 
                    onChange={handleTopLevelChange} 
                    className="form-select"
                    style={{ flex: 1, color: formData.propertyType ? 'inherit' : '#94a3b8' }}
                  >
                    <option value="" disabled style={{ color: '#94a3b8' }}>Select Category</option>
                    {propertyTypes.map(t => <option key={t} value={t} style={{ color: 'var(--slate-900)' }}>{t}</option>)}
                  </select>
                  <button type="button" className="btn btn-outline" onClick={() => setIsAddingType(true)}>+ Add New</button>
                </div>
              )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Publish Schedule Date
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginLeft: '0.5rem' }}>
                    (Optional - leave blank to publish now)
                  </span>
                </label>
                <input 
                  type="datetime-local" 
                  name="publishedAt" 
                  value={formData.publishedAt} 
                  onChange={handleTopLevelChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <select 
                  name="listingType" 
                  value={formData.listingType} 
                  onChange={handleTopLevelChange} 
                  required
                  className="form-select"
                  style={{ color: formData.listingType ? 'inherit' : '#94a3b8' }}
                >
                  <option value="" disabled style={{ color: '#94a3b8' }}>Select Option</option>
                  <option value="Sale" style={{ color: 'var(--slate-900)' }}>Sale</option>
                  <option value="Rent" style={{ color: 'var(--slate-900)' }}>Rent</option>
                  <option value="Lease" style={{ color: 'var(--slate-900)' }}>Lease</option>
                </select>
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
                  placeholder="Enter Property Title" 
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
                placeholder="Enter Full Property Overview & Description" 
              />
            </div>


          </div>
        </div>

        {/* SECTION 2: SPECIFICATIONS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>2. Specifications</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.listingType === 'Rent' ? (
                <div className="form-group">
                  <label className="form-label">BHK Type *</label>
                  <select
                    required
                    value={formData.specifications.bhkType || ''}
                    onChange={(e) => handleNestedChange('specifications', 'bhkType', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Option</option>
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="4+ BHK">4+ BHK</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Total area size *</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={formData.specifications.carpetAreaSqFt} 
                      onChange={(e) => handleNestedChange('specifications', 'carpetAreaSqFt', e.target.value)} 
                      className="form-input" 
                      placeholder="Enter Total area size" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Area Unit *</label>
                    {!isAddingUnit ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          required
                          value={formData.specifications.areaUnit}
                          onChange={(e) => handleNestedChange('specifications', 'areaUnit', e.target.value)}
                          className="form-select"
                          style={{ flex: 1 }}
                        >
                          <option value="">Select Option</option>
                          {areaUnits.map((u, i) => (
                            <option key={i} value={u}>{u}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddingUnit(true)}
                          style={{
                            padding: '0 0.8rem',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={newAreaUnit}
                          onChange={(e) => setNewAreaUnit(e.target.value)}
                          placeholder="e.g. Acres, Sq. Meters"
                          className="form-input"
                          style={{ flex: 1 }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddAreaUnit}
                          style={{
                            padding: '0 0.8rem',
                            background: '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingUnit(false);
                            setNewAreaUnit('');
                          }}
                          style={{
                            padding: '0 0.8rem',
                            background: 'transparent',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>


          </div>
        </div>

        {/* SECTION 3: PRICING */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>3. Pricing</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Price in ₹ (INR) *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={formData.pricing.price} 
                    onChange={(e) => handleNestedChange('pricing', 'price', e.target.value)} 
                    className="form-input" 
                    placeholder="Enter Price in ₹ (INR)" 
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                  {formData.pricing.price ? `Formatted: ₹${Number(formData.pricing.price).toLocaleString('en-IN')}` : 'Enter numerical price'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Price Type *</label>
                <select 
                  required
                  value={formData.pricing.priceType} 
                  onChange={(e) => handleNestedChange('pricing', 'priceType', e.target.value)} 
                  className="form-select"
                >
                  <option value="">Select Option</option>
                  <option value="Total">Total Price</option>
                  <option value="Per Unit">Per Unit Price</option>
                </select>
              </div>

              {formData.listingType === 'Rent' && (
                <div className="form-group">
                  <label className="form-label">Monthly Maintenance Charges</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.pricing.maintenanceCharges} 
                    onChange={(e) => handleNestedChange('pricing', 'maintenanceCharges', e.target.value)} 
                    className="form-input" 
                    placeholder="Enter Charges" 
                  />
                </div>
              )}
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
        </div>

        {/* SECTION 4: LOCATION */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>4. Location</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input 
                type="text" 
                required 
                value={formData.location.address} 
                onChange={(e) => handleNestedChange('location', 'address', e.target.value)} 
                className="form-input" 
                placeholder="Enter Full Address" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input 
                  type="text" 
                  required
                  value={formData.location.pincode} 
                  onChange={(e) => handleNestedChange('location', 'pincode', e.target.value)} 
                  className="form-input" 
                  placeholder="Enter Pincode" 
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
                  placeholder="Enter City" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input 
                  type="text" 
                  required
                  value={formData.location.state} 
                  onChange={(e) => handleNestedChange('location', 'state', e.target.value)} 
                  className="form-input" 
                  placeholder="Enter State"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Locality / Neighborhood (Optional)</label>
                <input 
                  type="text" 
                  value={formData.location.locality} 
                  onChange={(e) => handleNestedChange('location', 'locality', e.target.value)} 
                  className="form-input" 
                  placeholder="Enter Locality / Neighborhood" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nearby Landmark</label>
                <input 
                  type="text" 
                  value={formData.location.landmark} 
                  onChange={(e) => handleNestedChange('location', 'landmark', e.target.value)} 
                  className="form-input" 
                  placeholder="Enter Nearby Landmark" 
                />
              </div>
            </div>
          </div>
        </div>



        {/* SECTION 5: MEDIA GALLERY */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>5. Media Gallery (Upload images and video)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px' }}>
            {/* 1. Image Gallery */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>High-Resolution Media (MAX 4 Images and 2 Videos) *</label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Images: {existingImages.length + selectedImageFiles.length}/4 &bull; Videos: {existingVideos.length + selectedVideoFiles.length}/2
                </span>
              </div>

              <label htmlFor="media-files-upload" className="upload-dropzone">
                <UploadCloud size={36} color="#d49a3f" style={{ marginBottom: '0.4rem' }} />
                <div style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                  <span style={{ color: '#b87d28' }}>Browse images and videos</span> or drag & drop here
                </div>
                <input 
                  id="media-files-upload" 
                  type="file" 
                  style={{ display: 'none' }} 
                  multiple 
                  accept="image/*,video/mp4,video/webm,video/quicktime" 
                  onChange={handleMediaFileChange} 
                />
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
                  Supports JPG, PNG, WEBP, MP4, WebM
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

              {/* Newly selected media chips */}
              {(selectedImageFiles.length > 0 || selectedVideoFiles.length > 0) && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedImageFiles.map((file, i) => (
                    <div key={`img-${i}`} className="upload-file-chip">
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
                  {selectedVideoFiles.map((file, i) => (
                    <div key={`vid-${i}`} className="upload-file-chip">
                      <Video size={14} color="#3b82f6" />
                      <span className="file-name" title={file.name}>{file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedVideoFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="file-remove-btn"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Walkthrough Video & 3. Floor Plans side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              {/* Walkthrough Video */}
              <div>
                <label className="form-label">Walkthrough Video Link</label>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <input 
                    type="url" 
                    value={formData.customVideoUrl} 
                    onChange={(e) => setFormData(prev => ({ ...prev, customVideoUrl: e.target.value }))} 
                    className="form-input" 
                    placeholder="Paste YouTube / Video link here" 
                  />
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

              {/* Floor Plans */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Floor Plans & Architectural Blueprints (Max 3)</label>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Floor Plans: {existingFloorPlans.length + selectedFloorPlanFiles.length}/3
                  </span>
                </div>
                
                <label htmlFor="floorplan-file-upload" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', padding: '0.65rem 1.25rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
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
          </div>
        </div>

        {/* SECTION 6: AMENITIES (CONDITIONAL) */}
        {formData.listingType === 'Rent' && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>6. Amenities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '850px' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Select all lifestyle amenities and infrastructure features available for this listing:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {availableAmenities.map((amenity) => {
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

                {/* Add Custom Amenity */}
                {isAddingAmenity ? (
                  <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1', maxWidth: '300px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.5rem', fontSize: '0.9rem', flex: 1 }}
                      placeholder="Custom amenity..."
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={handleAddAmenity}
                      style={{
                        background: '#d49a3f', color: '#fff', border: 'none', borderRadius: '6px',
                        padding: '0 1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                      }}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingAmenity(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px dashed #cbd5e1',
                      background: 'transparent',
                      color: '#64748b',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d49a3f';
                      e.currentTarget.style.color = '#d49a3f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    <Plus size={16} /> Add Amenity
                  </button>
                )}
              </div>
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
