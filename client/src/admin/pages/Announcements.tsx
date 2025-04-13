import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Removed unused import
import { supabase } from '@/utils/supabaseClient';
import AnnouncementForm from '../components/AnnouncementForm';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  type: 'ticker' | 'slide' | 'popup';
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw new Error(fetchError.message);
        if (data) setAnnouncements(data);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(`Failed to load announcements: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    if (!showForm) {
       fetchAnnouncements();
    }
  }, [showForm]);

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesType = typeFilter === '' || announcement.type === typeFilter;
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = announcement.active === true;
    else if (statusFilter === 'inactive') matchesStatus = announcement.active === false;
    else if (statusFilter === 'scheduled') {
      const now = new Date();
      const startDate = announcement.start_date ? new Date(announcement.start_date) : null;
      const endDate = announcement.end_date ? new Date(announcement.end_date) : null;
      matchesStatus = Boolean(announcement.active === true && ((startDate && startDate > now) || (endDate && endDate > now)));
    }
    return matchesType && matchesStatus;
  });

  const toggleAnnouncementStatus = async (id: string, active: boolean) => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase.from('announcements').update({ active: !active }).eq('id', id);
      if (updateError) throw new Error(updateError.message);
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, active: !active } : a));
    } catch (err: any) {
      console.error('Error toggling announcement status:', err);
      setError(`Failed to update announcement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      setIsDeleting(true);
      const { error: deleteError } = await supabase.from('announcements').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      setError(`Failed to delete announcement: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateAnnouncement = () => { setEditingAnnouncementId(null); setShowForm(true); };
  const handleEditAnnouncement = (id: string) => { setEditingAnnouncementId(id); setShowForm(true); };
  const handleFormSave = () => { setShowForm(false); setEditingAnnouncementId(null); };
  const handleFormCancel = () => { setShowForm(false); setEditingAnnouncementId(null); };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    try { return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return 'Invalid Date'; }
  };

  const renderListView = () => (
    <div>
      {/* Filters */}
      <div className="product-filter-bar">
        <div>
          <label htmlFor="type" className="form-label">Type</label>
          <select id="type" name="type" className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="ticker">Ticker</option>
            <option value="slide">Slide</option>
            <option value="popup">Popup</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="form-label">Status</label>
          <select id="status" name="status" className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-error mb-6"><div className="alert-content"><p>{error}</p></div></div>}

      {/* Table / Loading / Empty State */}
      {loading ? (
        <div className="loading-indicator">
          <svg className="loading-spinner" /* ... */ > {/* ... */} </svg>
          <p className="loading-text">Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">No announcements found</h3>
          <p className="empty-state-message">{typeFilter || statusFilter ? 'Try adjusting filters.' : 'Add a new announcement.'}</p>
        </div>
      ) : (
        <div className="announcement-cards">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <div className="announcement-card-header">
                <h3 className="announcement-card-title">{announcement.title}</h3>
                <div className="announcement-card-badges">
                  <span className={`announcement-type-badge ${announcement.type}`}>
                    {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                  </span>
                  <span className={`announcement-status-badge ${announcement.active ? 'active' : 'inactive'}`}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="announcement-card-content">
                <p className="announcement-card-text">{announcement.content}</p>
                <div className="announcement-card-dates">
                  <div>Start: {formatDate(announcement.start_date)}</div>
                  <div>End: {formatDate(announcement.end_date)}</div>
                </div>
              </div>
              
              {announcement.image_url && (
                <div className="announcement-card-image">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${announcement.image_url}`}
                    alt={announcement.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="announcement-card-actions">
                <button
                  onClick={() => toggleAnnouncementStatus(announcement.id, announcement.active)}
                  className={`status-toggle ${announcement.active ? 'bg-green-500' : 'bg-gray-200'}`}
                  title={announcement.active ? 'Deactivate' : 'Activate'}
                >
                  <div className={`status-toggle-knob ${announcement.active ? 'status-toggle-knob-active' : ''}`} />
                </button>
                
                <button
                  onClick={() => handleEditAnnouncement(announcement.id)}
                  className="admin-button admin-button-primary"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  disabled={isDeleting}
                  className="admin-button admin-button-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
      <div className="category-page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Announcements</h1>
          <button onClick={handleCreateAnnouncement} className="admin-button admin-button-primary">
            Add New Announcement
          </button>
        </div>

        {/* Render form or list view */}
        {showForm ? (
          <AnnouncementForm
            announcementId={editingAnnouncementId || undefined}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        ) : (
          renderListView() // Call function to render list view
        )}
      </div>
  );
};

export default AnnouncementsPage;
