import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { fetchApi } from '../api';
import './Universities.css';

interface University {
  id: number;
  name: string;
}

export function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {    
    try {
      setLoading(true);
      const data = await fetchApi('/universities');
      setUniversities(data);
    } catch (error) {
      console.error('Failed to load universities', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUniName.trim()) return;
    try {
      const data = await fetchApi('/universities', {
        method: 'POST',
        body: JSON.stringify({ name: newUniName.trim() }),
      });
      setUniversities([...universities, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewUniName('');
      setIsAdding(false);
    } catch (error) {
      alert('Failed to add university');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const data = await fetchApi(`/universities/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingName.trim() }),
      });
      setUniversities(universities.map(u => u.id === id ? data : u).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingId(null);
    } catch (error) {
      alert('Failed to update university');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this university?')) return;
    try {
      await fetchApi(`/universities/${id}`, { method: 'DELETE' });
      setUniversities(universities.filter(u => u.id !== id));
    } catch (error) {
      alert('Failed to delete university');
    }
  };

  const filteredUniversities = universities.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="universities-container">
      <div className="page-header">
        <div>
          <h1>Universities Management</h1>
          <p>Add, edit or remove universities from the system</p>
        </div>
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Add University
        </button>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search universities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="universities-table-wrapper">
        <table className="universities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>University Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="adding-row">
                <td>New</td>
                <td>
                  <input 
                    type="text" 
                    value={newUniName} 
                    onChange={(e) => setNewUniName(e.target.value)}
                    autoFocus
                    placeholder="Enter university name"
                  />
                </td>
                <td className="actions">
                  <button className="confirm-btn" onClick={handleAdd}><Check size={18} /></button>
                  <button className="cancel-btn" onClick={() => setIsAdding(false)}><X size={18} /></button>
                </td>
              </tr>
            )}
            {loading ? (
              <tr><td colSpan={3} className="text-center">Loading...</td></tr>
            ) : filteredUniversities.length === 0 ? (
              <tr><td colSpan={3} className="text-center">No universities found</td></tr>
            ) : (
              filteredUniversities.map(uni => (
                <tr key={uni.id}>
                  <td>{uni.id}</td>
                  <td>
                    {editingId === uni.id ? (
                      <input 
                        type="text" 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      uni.name
                    )}
                  </td>
                  <td className="actions">
                    {editingId === uni.id ? (
                      <>
                        <button className="confirm-btn" onClick={() => handleUpdate(uni.id)}><Check size={18} /></button>
                        <button className="cancel-btn" onClick={() => setEditingId(null)}><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => {
                          setEditingId(uni.id);
                          setEditingName(uni.name);
                        }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(uni.id)}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Universities;
