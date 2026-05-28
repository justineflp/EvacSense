import React, { useEffect, useState } from 'react';
import { NGE_FLOOR_LAYOUTS, NGE_FLOOR_TITLES } from '../ngeFloorLayouts';

export default function Dashboard({ user, token, onLogout }) {
  const [usersList, setUsersList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Module 2 states (Drills & Occupancy)
  const [activeDrill, setActiveDrill] = useState(null);
  const [roomsOccupancy, setRoomsOccupancy] = useState([]);
  const [unverifiedList, setUnverifiedList] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [loadingDrill, setLoadingDrill] = useState(false);

  // Admin/Coordinator Operations Messages
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Rejection Reason Prompt States
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // activeTab State for coordinator panels
  const [activeTab, setActiveTab] = useState('occupancy'); // occupancy | navigation

  // Module 3 Graph States
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [testPath, setTestPath] = useState([]);
  const [testInstructions, setTestInstructions] = useState([]);
  const [errorPath, setErrorPath] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(1);

  // Add Node form states
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeFloor, setNewNodeFloor] = useState('4');
  const [newNodeX, setNewNodeX] = useState('0');
  const [newNodeY, setNewNodeY] = useState('0');

  // Add Edge form states
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState('5.0');

  // Fetch Graph (nodes & edges)
  const fetchGraph = async () => {
    setLoadingGraph(true);
    try {
      const nodesRes = await fetch('http://127.0.0.1:5000/api/nav/nodes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const nodesData = await nodesRes.json();
      
      const edgesRes = await fetch('http://127.0.0.1:5000/api/nav/edges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const edgesData = await edgesRes.json();

      if (nodesRes.ok && edgesRes.ok) {
        setNodes(nodesData.nodes || []);
        setEdges(edgesData.edges || []);
      }
    } catch (err) {
      console.error("Failed to load map graph data:", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  // Dijkstra test path finding
  const calculateTestRoute = async (originId) => {
    if (!originId) return;
    setTestPath([]);
    setTestInstructions([]);
    setErrorPath('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/nav/route?origin=${originId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setTestPath(data.route.path || []);
        setTestInstructions(data.route.instructions || []);
      } else {
        setErrorPath(data.message || 'No clear path found. All exits are blocked!');
      }
    } catch (err) {
      setErrorPath('Connection to pathfinding service failed.');
    }
  };

  // Toggle path blockage (link collapse/fire)
  const handleToggleBlockage = async (edgeId, currentStatus) => {
    setActionMessage('');
    setActionError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/nav/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ edgeId, isBlocked: !currentStatus })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setActionMessage(data.message);
        fetchGraph();
        if (selectedOrigin) {
          calculateTestRoute(selectedOrigin);
        }
      } else {
        setActionError(data.message || 'Failed to update blockage.');
      }
    } catch (err) {
      setActionError('Link blockage update failed.');
    }
  };

  // Create edge connection
  const handleAddEdge = async (e) => {
    e.preventDefault();
    if (!newEdgeFrom || !newEdgeTo || newEdgeFrom === newEdgeTo) return;
    setActionMessage('');
    setActionError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/nav/edges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromNodeId: newEdgeFrom,
          toNodeId: newEdgeTo,
          weight: parseFloat(newEdgeWeight) || 5.0
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setActionMessage(data.message);
        fetchGraph();
        setNewEdgeWeight('5.0');
      } else {
        setActionError(data.message || 'Failed to create map link.');
      }
    } catch (err) {
      setActionError('Link connection creation failed.');
    }
  };

  // Create new node
  const handleAddNode = async (e) => {
    e.preventDefault();
    if (!newNodeId || !newNodeName || !newNodeFloor) return;
    setActionMessage('');
    setActionError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/nav/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newNodeId,
          name: newNodeName,
          floor: parseInt(newNodeFloor),
          building: 'College of Computer Studies',
          xMin: parseFloat(newNodeX) || 0,
          xMax: (parseFloat(newNodeX) || 0) + 10,
          yMin: parseFloat(newNodeY) || 0,
          yMax: (parseFloat(newNodeY) || 0) + 10
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setActionMessage(data.message);
        fetchGraph();
        setNewNodeId('');
        setNewNodeName('');
        setNewNodeFloor('4');
        setNewNodeX('0');
        setNewNodeY('0');
      } else {
        setActionError(data.message || 'Failed to create node.');
      }
    } catch (err) {
      setActionError('Node creation failed.');
    }
  };

  // Sync users database (Admin only)
  const fetchUsers = async () => {
    if (user.role !== 'System Admin') return;
    setLoadingUsers(true);
    setActionError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setUsersList(data.users);
      } else {
        setActionError(data.message || 'Could not fetch user registry.');
      }
    } catch (err) {
      setActionError('Failed to sync with user database.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Sync pending approvals requests (Admin only)
  const fetchPendingRequests = async () => {
    if (user.role !== 'System Admin') return;
    setLoadingRequests(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setPendingRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to sync pending registrations:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch active drill & occupancy headcounts (Admin & Coordinator & Teacher)
  const fetchDrillState = async () => {
    if (user.role === 'Student') return;
    setLoadingDrill(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/presence/occupancy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActiveDrill(data.activeDrill);
        setRoomsOccupancy(data.rooms || []);
        setUnverifiedList(data.unverifiedList || []);
        setTotalParticipants(data.totalParticipants || 0);
        setVerifiedCount(data.verifiedCount || 0);
        setUnverifiedCount(data.unverifiedCount || 0);
      }
    } catch (err) {
      console.error('Failed to sync live drill occupancy state:', err);
    } finally {
      setLoadingDrill(false);
    }
  };

  const syncAdminData = () => {
    fetchUsers();
    fetchPendingRequests();
  };

  useEffect(() => {
    if (user.role === 'System Admin') {
      syncAdminData();
    }
    
    // Connect all authenticated roles (including Student) to real-time events stream
    const sseSource = new EventSource('http://127.0.0.1:5000/api/presence/realtime');

    if (user.role === 'System Admin' || user.role === 'Drill Coordinator' || user.role === 'Teacher') {
      fetchGraph();
    }

    sseSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'success' && data.edge) {
          // Live route/blockage recalculation update broadcasted via SSE!
          if (user.role === 'System Admin' || user.role === 'Drill Coordinator' || user.role === 'Teacher') {
            fetchGraph();
          }
          return;
        }
        
        setActiveDrill(data.activeDrill);
        setRoomsOccupancy(data.rooms || []);
        setUnverifiedList(data.unverifiedList || []);
        setTotalParticipants(data.totalParticipants || 0);
        setVerifiedCount(data.verifiedCount || 0);
        setUnverifiedCount(data.unverifiedCount || 0);
      } catch (err) {
        console.error('[SSE REAL-TIME ERROR] Parsing pushed frame failed:', err);
      }
    };

    sseSource.onerror = (err) => {
      console.warn('[SSE CONNECTION WARNING] Reconnecting real-time stream...');
    };

    return () => {
      sseSource.close();
    };
  }, [user.role, token]);

  const handleRoleChange = async (userId, newRole) => {
    setActionMessage('');
    setActionError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActionMessage(data.message);
        syncAdminData();
      } else {
        setActionError(data.message || data.errors?.[0] || 'Role update rejected.');
      }
    } catch (err) {
      setActionError('Role assignment failed.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    setActionMessage('');
    setActionError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActionMessage(data.message);
        syncAdminData();
      } else {
        setActionError(data.message || data.errors?.[0] || 'Approval failed.');
      }
    } catch (err) {
      setActionError('Request approval failed.');
    }
  };

  const handleRejectRequestSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setActionError('A rejection reason is required.');
      return;
    }
    setActionMessage('');
    setActionError('');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/requests/${rejectingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActionMessage(data.message);
        setRejectingId(null);
        setRejectionReason('');
        syncAdminData();
      } else {
        setActionError(data.message || data.errors?.[0] || 'Rejection failed.');
      }
    } catch (err) {
      setActionError('Request rejection failed.');
    }
  };

  // Module 2: Start drill session trigger
  const handleStartDrill = async () => {
    setActionMessage('');
    setActionError('');
    setLoadingDrill(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/drill/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: 'CIT-U Annual Earthquake Drill ' + new Date().getFullYear() })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActionMessage(data.message);
        fetchDrillState();
      } else {
        setActionError(data.message || 'Failed to activate drill session.');
      }
    } catch (err) {
      setActionError('Drill initialization failed.');
    } finally {
      setLoadingDrill(false);
    }
  };

  // Module 2: Conclude active drill session trigger
  const handleConcludeDrill = async () => {
    setActionMessage('');
    setActionError('');
    setLoadingDrill(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/drill/conclude', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setActionMessage(data.message);
        fetchDrillState();
      } else {
        setActionError(data.message || 'Failed to conclude drill session.');
      }
    } catch (err) {
      setActionError('Drill conclusion failed.');
    } finally {
      setLoadingDrill(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {}
    onLogout();
  };

  const renderBadge = (role) => {
    switch (role) {
      case 'Student': return <span className="badge badge-student">Student</span>;
      case 'Teacher': return <span className="badge badge-teacher">Teacher/Staff</span>;
      case 'Drill Coordinator': return <span className="badge badge-coordinator">Drill Coordinator</span>;
      case 'System Admin': return <span className="badge badge-admin">System Admin</span>;
      default: return <span className="badge">{role}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 2rem', position: 'relative' }}>
      
      {/* Top Banner Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        <div>
          <h1 className="brand-title" style={{ textAlign: 'left', fontSize: '2rem' }}>EvacSense Suite</h1>
          <p className="brand-subtitle" style={{ textAlign: 'left' }}>Safety Administration Console</p>
        </div>
        
        <button 
          onClick={handleLogoutClick}
          className="btn btn-secondary" 
          style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}
        >
          Logout Secure Session
        </button>
      </div>

      {/* Admin Actions Alert Banner */}
      {(actionMessage || actionError || rejectingId) && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          {actionMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem'
            }}>{actionMessage}</div>
          )}
          {actionError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem'
            }}>{actionError}</div>
          )}
          {rejectingId && (
            <form onSubmit={handleRejectRequestSubmit} style={{ marginTop: '0.5rem', textAlign: 'left' }}>
              <h4 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1rem', marginBottom: '0.5rem' }}>Provide Verification Rejection Reason</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Employee ID does not match safety registry"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Confirm Rejection</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setRejectingId(null); setRejectionReason(''); }} style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Grid Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: (user.role === 'System Admin' || user.role === 'Drill Coordinator') ? '1fr' : '1fr 2fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: User Profile Card (Standard users) */}
        {user.role !== 'System Admin' && user.role !== 'Drill Coordinator' && (
          <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(153, 27, 27, 0.2))',
                border: '1px solid rgba(255,255,255,0.1)',
                margin: '0 auto 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'var(--accent-gold)'
              }}>🛡️</div>
              
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>{user.name}</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>{user.email}</span>
              {renderBadge(user.role)}
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Department</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{user.department || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Authorization ID</span>
                <code style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{user.id}</code>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Student/Teacher View */}
        {user.role !== 'System Admin' && user.role !== 'Drill Coordinator' && (
          <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeIn 0.6s ease-out' }}>
            <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Pre-Drill Presence Detection</h3>
            {activeDrill ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '1.25rem', borderRadius: '12px', textAlign: 'left', animation: 'pulseGlow 2s infinite ease-in-out' }}>
                <strong style={{ color: '#34d399', display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>⚠️ DRILL SESSION IS ACTIVE!</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  A drill coordinator has activated **{activeDrill.name}**. Students and teachers must execute pre-drill localization now!
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <p style={{ color: '#ffffff', fontSize: '0.85rem' }}><strong>Please trigger localization inside your mobile application:</strong></p>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <li>Wifi RSSI signals will auto-triangulate your classroom positioning.</li>
                    <li>If automatic scanning fails, use the Manual Location Selection dropdown.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>💤</span>
                <strong style={{ color: '#ffffff', display: 'block' }}>No Active Drill Session</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Drill baselines and classroom triangulation scans will open when a safety officer triggers the drill.</p>
              </div>
            )}
          </div>
        )}

        {/* Coordinators & Admin Live Dashboards Panel (Modules 1 & 2) */}
        {(user.role === 'System Admin' || user.role === 'Drill Coordinator') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
            
            {/* Panel 1: Drill Control Panel (Module 2) */}
            <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.4rem', fontWeight: 700 }}>Drill Coordination Dashboard</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Trigger live drill events and evaluate classroom baseline presence tracking</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {!activeDrill ? (
                    <button 
                      onClick={handleStartDrill} 
                      className="btn btn-primary" 
                      style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                      disabled={loadingDrill}
                    >
                      🚀 Initiate Earthquake Drill Run
                    </button>
                  ) : (
                    <button 
                      onClick={handleConcludeDrill} 
                      className="btn btn-primary" 
                      style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#ffffff', boxShadow: 'none' }}
                      disabled={loadingDrill}
                    >
                      🛑 Conclude Active Drill Run
                    </button>
                  )}
                </div>
              </div>

              {activeDrill && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(251, 191, 36, 0.04)',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', tracking: '0.05em' }}>⚠️ LIVE DRILL ACTIVE:</span>
                    <strong style={{ color: '#ffffff', display: 'block', fontSize: '1.05rem', marginTop: '0.15rem' }}>{activeDrill.name}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>Total Registered</span>
                      <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>{totalParticipants}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>Verified Origins</span>
                      <strong style={{ fontSize: '1.15rem', color: '#10b981' }}>{verifiedCount}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>Location Unverified</span>
                      <strong style={{ fontSize: '1.15rem', color: '#ef4444' }}>{unverifiedCount}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1.25rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={() => setActiveTab('occupancy')}
                className={`btn ${activeTab === 'occupancy' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                📊 Drill Attendance & Occupancy
              </button>
              <button
                onClick={() => {
                  setActiveTab('navigation');
                  fetchGraph();
                }}
                className={`btn ${activeTab === 'navigation' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                🗺️ Evacuation Path Designer & Rerouting
              </button>
            </div>

            {activeTab === 'occupancy' ? (
              <>
                {/* Panel 2: Live Room Headcounts & Triangulations Dashboard (Module 2) */}
                {activeDrill && (
                  <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.6s ease-out' }}>
                    <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                      Campus Room Occupancies Dashboard
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Room Code</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Room Name</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Floor</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Occupancy</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Auto (RSSI)</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Manual Fallbacks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomsOccupancy.map((room) => (
                            <tr key={room.roomId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                <code style={{ color: 'var(--accent-gold)' }}>{room.roomId}</code>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                                {room.roomName}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Floor {room.floor}
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ 
                                  fontSize: '0.9rem', 
                                  fontWeight: 700, 
                                  color: room.totalHeadcount > 0 ? '#34d399' : 'var(--text-muted)'
                                }}>
                                  {room.totalHeadcount} Students
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#60a5fa' }}>{room.autoRSSI}</td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#fbbf24' }}>{room.manualOverride}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Panel 3: Location-Unverified Student Triage Roster (Module 2) */}
                {activeDrill && unverifiedList.length > 0 && (
                  <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.6s ease-out' }}>
                    <h3 style={{ fontFamily: 'Outfit', color: '#ef4444', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Location-Unverified Student Triage Roster
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      These students have not registered classroom locations. Keep track during manual assembly checks.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student ID</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Institutional Email</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unverifiedList.map((stu) => (
                            <tr key={stu.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                <code>{stu.userId}</code>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{stu.name}</td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stu.email}</td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stu.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Panel 4: Administrative Pending Staff Accounts (Module 1 approvals) */}
                {user.role === 'System Admin' && (
                  <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.35rem', fontWeight: 700 }}>
                          Pending Staff Registration Requests
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Review, approve, or reject Teacher/Coordinator registration payloads
                        </p>
                      </div>
                      <button 
                        onClick={fetchPendingRequests} 
                        className="btn btn-secondary" 
                        style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        disabled={loadingRequests}
                      >
                        Sync Requests
                      </button>
                    </div>

                    {pendingRequests.length === 0 ? (
                      <div style={{
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-glass)'
                      }}>
                        <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>🎉</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending requests.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee ID</th>
                              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</th>
                              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Institutional Email</th>
                              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</th>
                              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Review Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingRequests.map((req) => (
                              <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                  <code style={{ color: 'var(--accent-gold)' }}>{req.id}</code>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{req.name}</td>
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.email}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>{renderBadge(req.role)}</td>
                                <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => handleApproveRequest(req.id)} className="btn btn-primary" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', boxShadow: 'none' }}>Approve</button>
                                  <button onClick={() => setRejectingId(req.id)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: '1px solid #ef4444', color: '#ef4444' }}>Reject</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Panel 5: Admin User Directory List (Module 1 management) */}
                {user.role === 'System Admin' && (
                  <div className="glass-panel" style={{ padding: '2.25rem', animation: 'fadeIn 0.6s ease-out' }}>
                    <div style={{ display: 'flex', justify: 'space-between', align: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.35rem', fontWeight: 700 }}>System User Directory</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active registered user accounts database</p>
                      </div>
                      <button 
                        onClick={fetchUsers} 
                        className="btn btn-secondary" 
                        style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        disabled={loadingUsers}
                      >
                        Sync Directory
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>UID</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Identity Name</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Security Status</th>
                            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Policy Override Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((usr) => (
                            <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}><code style={{ color: 'var(--accent-gold)' }}>{usr.id}</code></td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{usr.name}</td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{usr.email}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{renderBadge(usr.role)}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  color: usr.status === 'locked' ? '#ef4444' : usr.status === 'Rejected' ? '#ef4444' : '#10b981',
                                  background: usr.status === 'locked' ? 'rgba(239, 68, 68, 0.1)' : usr.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '6px'
                                }}>{usr.status === 'locked' ? 'LOCKED' : usr.status === 'Rejected' ? 'REJECTED' : 'ACTIVE'}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <select
                                  className="form-input"
                                  value={usr.role}
                                  onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(15,23,42,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#ffffff' }}
                                >
                                  <option value="Student">Student</option>
                                  <option value="Teacher">Teacher/Staff</option>
                                  <option value="Drill Coordinator">Drill Coordinator</option>
                                  <option value="System Admin">System Admin</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Evacuation Path Designer Tab Component */
              <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
                  {/* Visual Map Canvas */}
                  <div>
                    <h4 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.25rem', textAlign: 'left' }}>
                      🏢 NGE Building — Evacuation Route Map
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'left' }}>
                      Dr. Nicolas G. Escario Sr. Building • CIT-U Campus (B1)
                    </p>

                    {/* Floor Selector Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {[1, 2, 3, 4].map(f => (
                        <button
                          key={f}
                          onClick={() => setSelectedFloor(f)}
                          className={`btn ${selectedFloor === f ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.78rem', borderRadius: '8px', transition: 'all 0.3s' }}
                        >
                          {f === 1 ? '1F Ground' : f === 2 ? '2F Labs' : f === 3 ? '3F Nursing' : '4F Medical'}
                        </button>
                      ))}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{NGE_FLOOR_TITLES[selectedFloor]}</strong> — 
                      <strong style={{ color: '#fbbf24' }}> Click a node to test Dijkstra pathing.</strong>
                      <strong style={{ color: '#ef4444' }}> Click a connection to toggle blockage.</strong>
                    </p>

                    {/* SVG Canvas Map */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
                    }}>
                      <svg width="660" height="420" style={{ overflow: 'visible' }}>
                        {/* Floor title watermark */}
                        <text x="330" y="415" textAnchor="middle" fill="rgba(255,255,255,0.08)" style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                          NGE BUILDING • FLOOR {selectedFloor}
                        </text>
                        {/* 1. Connections (Edges) */}
                        {edges.filter(edge => {
                          const fc = NGE_FLOOR_LAYOUTS[selectedFloor] || {};
                          return fc[edge.fromNodeId] && fc[edge.toNodeId];
                        }).map((edge, index) => {
                          const floorCoords = NGE_FLOOR_LAYOUTS[selectedFloor] || {};
                          const fromCoords = floorCoords[edge.fromNodeId];
                          const toCoords = floorCoords[edge.toNodeId];
                          
                          const isPathEdge = testPath.some((node, i) => {
                            if (i === 0) return false;
                            const prev = testPath[i - 1];
                            return (prev.id === edge.fromNodeId && node.id === edge.toNodeId) ||
                                   (prev.id === edge.toNodeId && node.id === edge.fromNodeId);
                          });

                          return (
                            <g key={edge.id}>
                              <line
                                x1={fromCoords.x}
                                y1={fromCoords.y}
                                x2={toCoords.x}
                                y2={toCoords.y}
                                stroke={edge.isBlocked ? '#ef4444' : isPathEdge ? '#10b981' : 'rgba(255,255,255,0.15)'}
                                strokeWidth={edge.isBlocked ? 4 : isPathEdge ? 6 : 3}
                                strokeDasharray={edge.isBlocked ? '6,6' : 'none'}
                                onClick={() => handleToggleBlockage(edge.id, edge.isBlocked)}
                                style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                              />
                              {isPathEdge && (
                                <line
                                  x1={fromCoords.x}
                                  y1={fromCoords.y}
                                  x2={toCoords.x}
                                  y2={toCoords.y}
                                  stroke="#34d399"
                                  strokeWidth={10}
                                  opacity={0.3}
                                  style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
                                />
                              )}
                            </g>
                          );
                        })}

                        {/* 2. Nodes */}
                        {nodes.filter(node => (NGE_FLOOR_LAYOUTS[selectedFloor] || {})[node.id]).map((node, index) => {
                          const coords = (NGE_FLOOR_LAYOUTS[selectedFloor] || {})[node.id];
                          const isSelected = selectedOrigin === node.id;
                          const isPartOfPath = testPath.some(n => n.id === node.id);

                          return (
                            <g 
                              key={node.id} 
                              transform={`translate(${coords.x}, ${coords.y})`}
                              onClick={() => {
                                setSelectedOrigin(node.id);
                                calculateTestRoute(node.id);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {isSelected && (
                                <circle r="22" fill="none" stroke="var(--accent-gold)" strokeWidth="2" style={{ animation: 'pulseGlow 1.5s infinite' }} />
                              )}
                              
                              <circle 
                                r="14" 
                                fill={node.id.startsWith('EXIT') ? '#047857' : isSelected ? 'var(--accent-gold)' : isPartOfPath ? '#10b981' : coords.color}
                                stroke="#0f172a" 
                                strokeWidth="3"
                                style={{ transition: 'all 0.3s' }}
                              />
                              
                              <text
                                y="-22"
                                textAnchor="middle"
                                fill="#ffffff"
                                style={{ fontSize: '0.75rem', fontFamily: 'Outfit', fontWeight: 600, pointerEvents: 'none' }}
                              >
                                {coords.label}
                              </text>

                              <text
                                y="4"
                                textAnchor="middle"
                                fill={isSelected ? '#020617' : '#ffffff'}
                                style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}
                              >
                                {node.id.split('-').slice(1).join('-')}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Test Path Results and Instructions */}
                    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                      <h5 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                        Dijkstra Pathfinding Simulation Output
                      </h5>
                      {selectedOrigin ? (
                        <div style={{
                          padding: '1.25rem',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Origin Location:</span>
                            <strong style={{ color: 'var(--accent-gold)', marginLeft: '0.5rem' }}>{selectedOrigin}</strong>
                          </div>

                          {errorPath ? (
                            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>⚠️ {errorPath}</div>
                          ) : (
                            <div>
                              <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                                ✔ Dijkstra shortest evacuation route successfully computed.
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {testInstructions.map((inst, index) => (
                                  <div key={index} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Step {index + 1}:</span>
                                    <span>{inst.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          Select any room node on the blueprint canvas to test shortest-path evacuation navigation step-by-step.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edge Connection List and Controls Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                    
                    {/* List of Pathway Links */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      maxHeight: '260px',
                      overflowY: 'auto'
                    }}>
                      <h5 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                        Active Map Connections
                      </h5>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {edges.map((edge) => (
                          <div 
                            key={edge.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem 0.75rem',
                              background: edge.isBlocked ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255,255,255,0.01)',
                              border: `1px solid ${edge.isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
                              <code>{edge.fromNodeId.split('-')[1] || edge.fromNodeId}</code>
                              <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>⇄</span>
                              <code>{edge.toNodeId.split('-')[1] || edge.toNodeId}</code>
                            </div>
                            
                            <button
                              onClick={() => handleToggleBlockage(edge.id, edge.isBlocked)}
                              className="btn btn-secondary"
                              style={{
                                width: 'auto',
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.7rem',
                                border: edge.isBlocked ? '1px solid #10b981' : '1px solid #ef4444',
                                color: edge.isBlocked ? '#10b981' : '#ef4444',
                                borderRadius: '6px'
                              }}
                            >
                              {edge.isBlocked ? 'Clear' : 'Block'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Map Pathway Link Form */}
                    <form onSubmit={handleAddEdge} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '1.5rem'
                    }}>
                      <h5 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Add Route Connection
                      </h5>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Origin Node</label>
                          <select
                            value={newEdgeFrom}
                            onChange={(e) => setNewEdgeFrom(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#020617', color: '#ffffff', marginTop: '0.25rem' }}
                            required
                          >
                            <option value="">-- Select node --</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.name.split(' ')[0]})</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Destination Node</label>
                          <select
                            value={newEdgeTo}
                            onChange={(e) => setNewEdgeTo(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#020617', color: '#ffffff', marginTop: '0.25rem' }}
                            required
                          >
                            <option value="">-- Select node --</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.name.split(' ')[0]})</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Distance Weight (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newEdgeWeight}
                            onChange={(e) => setNewEdgeWeight(e.target.value)}
                            className="form-input"
                            style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#020617', color: '#ffffff', marginTop: '0.25rem' }}
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          🔗 Bind Connection Link
                        </button>
                      </div>
                    </form>
                    
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
