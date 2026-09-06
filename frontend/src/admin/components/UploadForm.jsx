import React, { useState } from 'react';
import axios from 'axios';
import { X, UploadCloud, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['Residential', 'Commercial', 'Agricultural', 'Industrial'];
const units = ['Sq. Ft', 'Sq. Yds', 'Acres', 'Cents', 'Guntas'];

const UploadForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
    areaUnit: 'Sq. Ft',
    propertyType: 'Residential',
    status: 'published',
    publishedAt: new Date().toISOString().slice(0, 16)
  });
  
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      let selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 6) {
        toast.error('Maximum 6 media files are allowed. Only the first 6 have been selected.');
        selectedFiles = selectedFiles.slice(0, 6);
      }
      setImages(selectedFiles);
    }
  };

  const uploadMediaToBackend = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const res = await axios.post('/api/properties/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data.results;
    } catch (error) {
      console.error('Upload error', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload images first
      const uploadedImages = [];
      const publicIds = [];
      let finalVideoUrl = null;
      
      if (images.length > 0) {
        toast.loading('Uploading media...', { id: 'upload' });
        try {
          const results = await uploadMediaToBackend(images);
          results.forEach(result => {
             publicIds.push(result.publicId);
             if (result.isVideo) {
               finalVideoUrl = result.url;
             } else {
               uploadedImages.push(result.url);
             }
          });
        } catch(err) {
          throw new Error('Media upload failed. Please try again.');
        }
        toast.dismiss('upload');
      }

      const propertyData = {
        ...formData,
        price: Number(formData.price),
        area: Number(formData.area),
        images: uploadedImages.length > 0 ? uploadedImages : [],
        cloudinaryPublicIds: publicIds,
        videoUrl: finalVideoUrl,
        publishedAt: new Date(formData.publishedAt).toISOString()
      };

      await onSuccess(propertyData);
      toast.success('Property created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="#d49a3f" /> Add New Listing
        </h2>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" required name="title" value={formData.title} onChange={handleInputChange} className="form-input" placeholder="e.g. 5 Acres Farm Land" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" required name="price" value={formData.price} onChange={handleInputChange} className="form-input" placeholder="Price" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" required name="location" value={formData.location} onChange={handleInputChange} className="form-input" placeholder="City, Area" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Area</label>
                <input type="number" required name="area" value={formData.area} onChange={handleInputChange} className="form-input" placeholder="Value" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select name="areaUnit" value={formData.areaUnit} onChange={handleInputChange} className="form-select">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="form-select">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Launch Schedule (Leave as is for instant)</label>
              <input type="datetime-local" required name="publishedAt" value={formData.publishedAt} onChange={handleInputChange} className="form-input" />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" className="form-input" style={{ resize: 'none' }} placeholder="Detailed description of the property..."></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Media (Photos & Video)</label>
              <label htmlFor="file-upload" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem',
                border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc',
                transition: 'all 0.2s', textAlign: 'center'
              }}>
                <UploadCloud size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  <span style={{ color: '#3b82f6', fontWeight: 500 }}>Click to upload files</span> or drag and drop
                </div>
                <input id="file-upload" name="file-upload" type="file" style={{ display: 'none' }} multiple accept="image/*,video/*" onChange={handleFileChange} />
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Images & Videos up to 300MB (Max 6 files)</p>
              </label>
              {images.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {images.map((img, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.75rem', color: '#475569' }}>
                      {img.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onCancel} className="btn btn-outline" style={{ padding: '0.6rem 1.5rem' }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
