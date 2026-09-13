import React, { useState } from 'react';
import axios from 'axios';
import { X, UploadCloud, Plus, Video, Image, AlertCircle, FileText, Check, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressMediaBatch } from '../../utils/imageCompressor';

const categories = ['Residential', 'Commercial', 'Agricultural', 'Industrial'];
const units = ['Sq. Ft', 'Sq. Yds', 'Acres', 'Cents', 'Guntas'];

const UploadForm = ({ onSuccess, onCancel, initialData = null }) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined ? initialData.price : '',
    location: initialData?.location || '',
    area: initialData?.area !== undefined ? initialData.area : '',
    areaUnit: initialData?.areaUnit || 'Sq. Ft',
    propertyType: initialData?.propertyType || 'Residential',
    status: initialData?.status || 'published',
    videoUrl: initialData?.videoUrl || '',
    publishedAt: initialData?.publishedAt 
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  });

  const [existingImages, setExistingImages] = useState(
    Array.isArray(initialData?.images) ? initialData.images : []
  );
  const [existingPublicIds, setExistingPublicIds] = useState(
    Array.isArray(initialData?.cloudinaryPublicIds) ? initialData.cloudinaryPublicIds : []
  );
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...selectedFiles, ...newFiles];
      if (combined.length > 6) {
        toast.error('Maximum 6 media files allowed per listing.');
        setSelectedFiles(combined.slice(0, 6));
      } else {
        setSelectedFiles(combined);
      }
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMediaToBackend = async (files) => {
    const data = new FormData();
    files.forEach(file => data.append('files', file));
    
    const res = await axios.post('/api/properties/admin/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(`Uploading media to cloud (${percent}%)...`, { id: 'upload' });
        }
      }
    });
    return res.data.results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location || !formData.area) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const uploadedImages = [];
      const publicIds = [];
      let finalVideoUrl = formData.videoUrl.trim() || null;
      
      if (selectedFiles.length > 0) {
        toast.loading('Optimizing media files...', { id: 'upload' });
        try {
          // Compress high-res images before sending to backend/Cloudinary
          const optimizedFiles = await compressMediaBatch(selectedFiles, (progress) => {
            toast.loading(`Optimizing media files (${progress}%)...`, { id: 'upload' });
          });

          toast.loading('Uploading media to cloud (0%)...', { id: 'upload' });
          const results = await uploadMediaToBackend(optimizedFiles);
          results.forEach(result => {
            publicIds.push(result.publicId);
            if (result.isVideo && !finalVideoUrl) {
              finalVideoUrl = result.url;
            } else {
              uploadedImages.push(result.url);
            }
          });
        } catch (err) {
          throw new Error('Cloudinary media upload failed. Please verify file sizes and try again.');
        } finally {
          toast.dismiss('upload');
        }
      }

      const combinedImages = [...existingImages, ...uploadedImages];
      const combinedPublicIds = [...existingPublicIds, ...publicIds];

      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        location: formData.location.trim(),
        area: Number(formData.area),
        areaUnit: formData.areaUnit,
        propertyType: formData.propertyType,
        status: formData.status,
        images: combinedImages,
        cloudinaryPublicIds: combinedPublicIds,
        videoUrl: finalVideoUrl,
        publishedAt: new Date(formData.publishedAt).toISOString(),
        ...(formData.propertyId.trim() ? { propertyId: formData.propertyId.trim().toUpperCase() } : {})
      };

      const result = await onSuccess(propertyData);
      if (result && result.success === false) {
        throw new Error(result.message || (isEditMode ? 'Failed to update listing' : 'Failed to publish listing'));
      }
      toast.success(isEditMode ? 'Property details updated successfully!' : 'Property listing published successfully!');
    } catch (error) {
      console.error('Submit error', error);
      toast.error(error.message || (isEditMode ? 'Failed to update listing' : 'Failed to publish listing'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setExistingPublicIds(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="upload-form-card">
      <div className="upload-form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="upload-header-icon">
            {isEditMode ? <Edit3 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {isEditMode ? `Edit Listing (${formData.propertyId || 'Property'})` : 'Create New Property Listing'}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {isEditMode 
                ? 'Update pricing, dimensions, specifications, media walkthroughs, or listing status.'
                : 'Add a new luxury land or estate listing with photos, video walkthrough, and pricing.'}
            </p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onCancel} 
          className="modal-close-icon-btn"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
        <div className="upload-form-grid">
          {/* Left Column: Basic Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Custom Property ID {isEditMode ? '(Locked)' : '(Optional)'}
              </label>
              <input 
                type="text" 
                name="propertyId" 
                value={formData.propertyId} 
                onChange={handleInputChange} 
                disabled={isEditMode}
                className="form-input" 
                placeholder="Enter custom Property ID or leave blank to auto-generate from location" 
                style={{ 
                  textTransform: 'uppercase',
                  background: isEditMode ? '#f1f5f9' : '#ffffff',
                  cursor: isEditMode ? 'not-allowed' : 'text'
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input 
                type="text" 
                required 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="Enter property title" 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price in ₹ (INR) *</label>
                <input 
                  type="number" 
                  required 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Enter price in ₹ (INR)" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location / City *</label>
                <input 
                  type="text" 
                  required 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Enter location / city" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Area *</label>
                <input 
                  type="number" 
                  required 
                  name="area" 
                  value={formData.area} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Enter total area" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Area Unit *</label>
                <select 
                  name="areaUnit" 
                  value={formData.areaUnit} 
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Status *</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="sold">Sold Out</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Publish Schedule Date (Leave as is for Immediate Live)
              </label>
              <input 
                type="datetime-local" 
                required 
                name="publishedAt" 
                value={formData.publishedAt} 
                onChange={handleInputChange} 
                className="form-input" 
              />
            </div>
          </div>

          {/* Right Column: Description & Media */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Property Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows={4} 
                className="form-input" 
                style={{ resize: 'vertical' }} 
                placeholder="Enter detailed property description, title clearance, and connectivity details" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Video Walkthrough URL (YouTube Embed or MP4 Link)
              </label>
              <input 
                type="url" 
                name="videoUrl" 
                value={formData.videoUrl} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="Enter YouTube or video walkthrough URL" 
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                Optional: Paste a YouTube link or upload a video below.
              </span>
            </div>
            
            <div className="form-group">
              <label className="form-label">Upload High-Res Media (Up to 6 files)</label>
              <label htmlFor="file-upload" className="upload-dropzone">
                <UploadCloud size={38} color="#d49a3f" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                  <span style={{ color: '#b87d28' }}>Browse files</span> or drag & drop here
                </div>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  style={{ display: 'none' }} 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleFileChange} 
                />
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
                  Images & Video Walkthroughs (JPG, PNG, WEBP, MP4 up to 300MB)
                </p>
              </label>

              {/* Existing Images preview in Edit mode */}
              {existingImages.length > 0 && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Current Listing Media ({existingImages.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {existingImages.map((imgUrl, i) => (
                      <div 
                        key={i} 
                        style={{
                          position: 'relative',
                          width: '64px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          background: '#0f172a'
                        }}
                      >
                        <img src={typeof imgUrl === 'string' ? imgUrl : imgUrl?.url} alt="Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove media"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File list preview for newly selected files */}
              {selectedFiles.length > 0 && (
                <div className="upload-files-strip">
                  {selectedFiles.map((file, i) => {
                    const isVid = file.type.startsWith('video/');
                    return (
                      <div key={i} className="upload-file-chip">
                        {isVid ? <Video size={14} color="#3b82f6" /> : <Image size={14} color="#10b981" />}
                        <span className="file-name" title={file.name}>{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(i)} 
                          className="file-remove-btn"
                          title="Remove file"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="upload-form-footer">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="btn btn-outline" 
            style={{ padding: '0.65rem 1.65rem' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-gold" 
            style={{ padding: '0.65rem 1.85rem', minWidth: '160px' }}
          >
            {isSubmitting ? (
              <span>Saving Listing...</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={16} /> {isEditMode ? 'Update Property' : 'Publish Listing'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
