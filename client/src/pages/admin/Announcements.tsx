import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import AnnouncementForm from '../../components/admin/AnnouncementForm'; // Import the form
import ProductImage from '../../components/ProductImage'; // Re-use for announcement images

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  type: 'ticker' | 'slide' | 'popup';
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest first

      if (announcementsError) {
        throw new Error(`Error fetching announcements: ${announcementsError.message}`);
      }

      setAnnouncements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle creating a new announcement
  const handleCreateAnnouncement = () => {
    setEditingAnnouncementId(null);
    setShowForm(true);
  };

  // Handle editing an announcement
  const handleEditAnnouncement = (announcementId: string) => {
    setEditingAnnouncementId(announcementId);
    setShowForm(true);
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = async (announcementId: string) => {
     if (!window.confirm('Are you sure you want to delete this announcement?')) {
       return;
     }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) {
        throw new Error(`Error deleting announcement: ${error.message}`);
      }
      await fetchAnnouncements(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingAnnouncementId(null);
    fetchAnnouncements(); // Refresh list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAnnouncementId(null);
  };

  // Helper to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', { // Botswana uses similar format to South Africa
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };


  // Render loading state
  if (loading && !showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Render form
  if (showForm) {
    return (
      <div className="p-6">
        <AnnouncementForm
          announcementId={editingAnnouncementId || undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  // Render announcements list
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button
          onClick={handleCreateAnnouncement}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Announcement
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No announcements found. Click "Add New Announcement" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement.id}>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="h-10 w-10 flex-shrink-0">
                        {announcement.image_url ? (
                          <ProductImage
                            src={announcement.image_url}
                            alt={announcement.title}
                            // Announcements images went to 'products' bucket based on upload script
                            category={'products'}
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                     <div className="text-sm text-gray-500 truncate max-w-xs">
                      {announcement.content || '-'}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       announcement.type === 'ticker' ? 'bg-blue-100 text-blue-800' :
                       announcement.type === 'slide' ? 'bg-purple-100 text-purple-800' :
                       'bg-pink-100 text-pink-800' // popup
                     }`}>
                      {announcement.type}
                    </span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     {announcement.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {formatDate(announcement.start_date)} - {formatDate(announcement.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAnnouncement(announcement.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Announcements;