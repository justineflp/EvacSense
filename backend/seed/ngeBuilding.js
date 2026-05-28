/**
 * NGE Building Seed Data
 * Dr. Nicolas G. Escario Sr. Building — CIT-U Campus (B1)
 * Real evacuation route data extracted from actual building floor plans.
 */

const ngeRooms = [
  // ═══════════════════════════════════════════════════════════
  // FLOOR 1 — Ground Floor (Science and Technology Building)
  // Computer Studies Wing
  // ═══════════════════════════════════════════════════════════
  { id: 'ROOM-101', name: 'Computer Laboratory 101', floor: 1, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 28, yMax: 35 },
  { id: 'ROOM-102', name: 'Computer Laboratory 102', floor: 1, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 21, yMax: 28 },
  { id: 'ROOM-103', name: 'Computer Laboratory 103', floor: 1, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 14, yMax: 21 },
  { id: 'ROOM-104', name: 'Computer Laboratory 104', floor: 1, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 7, yMax: 14 },
  { id: 'ROOM-105', name: 'Computer Laboratory 105', floor: 1, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 0, yMax: 7 },
  { id: 'ROOM-106', name: 'College of Computer Studies Office', floor: 1, building: 'NGE Building', xMin: 15, xMax: 30, yMin: 0, yMax: 7 },
  { id: 'ROOM-107', name: 'RDCO/ITSO Conference Room', floor: 1, building: 'NGE Building', xMin: 0, xMax: 15, yMin: 10, yMax: 20 },
  { id: 'ROOM-108', name: 'Case Room 108', floor: 1, building: 'NGE Building', xMin: 0, xMax: 15, yMin: 22, yMax: 32 },
  // Floor 1 Infrastructure
  { id: 'CORRIDOR-1A', name: 'Ground Floor Main Hallway', floor: 1, building: 'NGE Building', xMin: 15, xMax: 30, yMin: 7, yMax: 35 },
  { id: 'STAIR-MAIN-F1', name: 'Main Staircase (Ground)', floor: 1, building: 'NGE Building', xMin: 18, xMax: 22, yMin: 33, yMax: 37 },
  { id: 'STAIR-FIRE-F1', name: 'NW Fire Exit Staircase (Ground)', floor: 1, building: 'NGE Building', xMin: 0, xMax: 4, yMin: 0, yMax: 4 },

  // ═══════════════════════════════════════════════════════════
  // FLOOR 2 — Dr. Nicolas G. Escario, Sr. Building
  // Computer Labs & Faculty Wing
  // ═══════════════════════════════════════════════════════════
  { id: 'ROOM-201', name: 'Computer Laboratory 201', floor: 2, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 28, yMax: 35 },
  { id: 'ROOM-202', name: 'Computer Laboratory 202', floor: 2, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 21, yMax: 28 },
  { id: 'ROOM-203', name: 'Computer Laboratory 203', floor: 2, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 14, yMax: 21 },
  { id: 'ROOM-204', name: 'Computer Laboratory 204', floor: 2, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 7, yMax: 14 },
  { id: 'ROOM-205', name: 'Computer Laboratory 205', floor: 2, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 0, yMax: 7 },
  { id: 'ROOM-206', name: 'CS Faculty Office', floor: 2, building: 'NGE Building', xMin: 15, xMax: 30, yMin: 0, yMax: 7 },
  { id: 'ROOM-207', name: 'eLearning Competency & Research Center', floor: 2, building: 'NGE Building', xMin: 0, xMax: 15, yMin: 10, yMax: 22 },
  // Floor 2 Infrastructure
  { id: 'CORRIDOR-2A', name: '2nd Floor Main Hallway', floor: 2, building: 'NGE Building', xMin: 15, xMax: 30, yMin: 7, yMax: 35 },
  { id: 'STAIR-MAIN-F2', name: 'Main Staircase (2nd Floor)', floor: 2, building: 'NGE Building', xMin: 18, xMax: 22, yMin: 33, yMax: 37 },
  { id: 'STAIR-FIRE-F2', name: 'NW Fire Exit Staircase (2nd Floor)', floor: 2, building: 'NGE Building', xMin: 0, xMax: 4, yMin: 0, yMax: 4 },

  // ═══════════════════════════════════════════════════════════
  // FLOOR 3 — Nicolas G. Escario Building
  // Nursing & Technical Support Wing
  // ═══════════════════════════════════════════════════════════
  { id: 'ROOM-301', name: 'Lecture Room 301', floor: 3, building: 'NGE Building', xMin: 36, xMax: 45, yMin: 0, yMax: 8 },
  { id: 'ROOM-302', name: 'Nursing Laboratory 302', floor: 3, building: 'NGE Building', xMin: 27, xMax: 36, yMin: 0, yMax: 8 },
  { id: 'ROOM-303', name: 'Nursing Laboratory 303', floor: 3, building: 'NGE Building', xMin: 18, xMax: 27, yMin: 0, yMax: 8 },
  { id: 'ROOM-304', name: 'Technical Support Group Office', floor: 3, building: 'NGE Building', xMin: 9, xMax: 18, yMin: 0, yMax: 8 },
  { id: 'ROOM-305', name: 'Nursing Laboratory 305', floor: 3, building: 'NGE Building', xMin: 0, xMax: 9, yMin: 0, yMax: 8 },
  { id: 'ROOM-306', name: 'TSG / Network Operation Center', floor: 3, building: 'NGE Building', xMin: 0, xMax: 10, yMin: 10, yMax: 22 },
  { id: 'ROOM-307', name: 'CNAHS Faculty Room 2', floor: 3, building: 'NGE Building', xMin: 9, xMax: 18, yMin: 24, yMax: 32 },
  { id: 'ROOM-308', name: 'Microbiology & Parasitology Room', floor: 3, building: 'NGE Building', xMin: 18, xMax: 30, yMin: 24, yMax: 32 },
  { id: 'ROOM-309', name: 'Human Anatomy & Physiology Lab', floor: 3, building: 'NGE Building', xMin: 30, xMax: 42, yMin: 24, yMax: 32 },
  // Floor 3 Infrastructure
  { id: 'CORRIDOR-3A', name: '3rd Floor North Hallway', floor: 3, building: 'NGE Building', xMin: 0, xMax: 45, yMin: 8, yMax: 12 },
  { id: 'CORRIDOR-3B', name: '3rd Floor South Hallway', floor: 3, building: 'NGE Building', xMin: 0, xMax: 42, yMin: 20, yMax: 24 },
  { id: 'STAIR-MAIN-F3', name: 'Main Staircase (3rd Floor)', floor: 3, building: 'NGE Building', xMin: 0, xMax: 4, yMin: 8, yMax: 12 },

  // ═══════════════════════════════════════════════════════════
  // FLOOR 4 — Nicolas G. Escario Building (Medical Wing)
  // College of Nursing & Health Sciences
  // ═══════════════════════════════════════════════════════════
  { id: 'ROOM-4-OR', name: 'Operating Room', floor: 4, building: 'NGE Building', xMin: 0, xMax: 12, yMin: 0, yMax: 10 },
  { id: 'ROOM-4-WARD', name: 'Ward', floor: 4, building: 'NGE Building', xMin: 18, xMax: 38, yMin: 0, yMax: 10 },
  { id: 'ROOM-4-AMPHITHEATER', name: 'Amphitheater 1', floor: 4, building: 'NGE Building', xMin: 38, xMax: 48, yMin: 0, yMax: 10 },
  { id: 'ROOM-4-CON', name: 'College of Nursing Office', floor: 4, building: 'NGE Building', xMin: 0, xMax: 10, yMin: 12, yMax: 22 },
  { id: 'ROOM-4-CNAHS', name: 'CNAHS Faculty Room 1', floor: 4, building: 'NGE Building', xMin: 0, xMax: 15, yMin: 24, yMax: 32 },
  { id: 'ROOM-4-SKILLS', name: 'Nursing Skills Laboratory', floor: 4, building: 'NGE Building', xMin: 15, xMax: 38, yMin: 24, yMax: 32 },
  // Floor 4 Infrastructure
  { id: 'CORRIDOR-4A', name: '4th Floor Main Hallway', floor: 4, building: 'NGE Building', xMin: 0, xMax: 48, yMin: 10, yMax: 14 },
  { id: 'STAIR-MAIN-F4', name: 'Main Staircase (4th Floor)', floor: 4, building: 'NGE Building', xMin: 0, xMax: 4, yMin: 10, yMax: 14 },

  // ═══════════════════════════════════════════════════════════
  // ASSEMBLY AREA — CIT Field (College Area)
  // ═══════════════════════════════════════════════════════════
  { id: 'EXIT-CIT-FIELD', name: 'CIT Field Assembly Area', floor: 1, building: 'CIT-U Campus', xMin: -20, xMax: -5, yMin: 15, yMax: 30 },
];

const ngeEdges = [
  // ── FLOOR 1 CONNECTIONS ──
  { fromNodeId: 'ROOM-101', toNodeId: 'CORRIDOR-1A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-102', toNodeId: 'CORRIDOR-1A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-103', toNodeId: 'CORRIDOR-1A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-104', toNodeId: 'CORRIDOR-1A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-105', toNodeId: 'CORRIDOR-1A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-106', toNodeId: 'CORRIDOR-1A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-107', toNodeId: 'CORRIDOR-1A', weight: 5.0, isBlocked: false },
  { fromNodeId: 'ROOM-108', toNodeId: 'CORRIDOR-1A', weight: 5.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-1A', toNodeId: 'STAIR-MAIN-F1', weight: 8.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-1A', toNodeId: 'STAIR-FIRE-F1', weight: 12.0, isBlocked: false },
  { fromNodeId: 'STAIR-MAIN-F1', toNodeId: 'EXIT-CIT-FIELD', weight: 15.0, isBlocked: false },
  { fromNodeId: 'STAIR-FIRE-F1', toNodeId: 'EXIT-CIT-FIELD', weight: 10.0, isBlocked: false },

  // ── FLOOR 2 CONNECTIONS ──
  { fromNodeId: 'ROOM-201', toNodeId: 'CORRIDOR-2A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-202', toNodeId: 'CORRIDOR-2A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-203', toNodeId: 'CORRIDOR-2A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-204', toNodeId: 'CORRIDOR-2A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-205', toNodeId: 'CORRIDOR-2A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-206', toNodeId: 'CORRIDOR-2A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-207', toNodeId: 'CORRIDOR-2A', weight: 5.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-2A', toNodeId: 'STAIR-MAIN-F2', weight: 8.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-2A', toNodeId: 'STAIR-FIRE-F2', weight: 12.0, isBlocked: false },

  // ── FLOOR 3 CONNECTIONS ──
  { fromNodeId: 'ROOM-301', toNodeId: 'CORRIDOR-3A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-302', toNodeId: 'CORRIDOR-3A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-303', toNodeId: 'CORRIDOR-3A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-304', toNodeId: 'CORRIDOR-3A', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-305', toNodeId: 'CORRIDOR-3A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-306', toNodeId: 'CORRIDOR-3B', weight: 4.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-3A', toNodeId: 'CORRIDOR-3B', weight: 12.0, isBlocked: false },
  { fromNodeId: 'ROOM-307', toNodeId: 'CORRIDOR-3B', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-308', toNodeId: 'CORRIDOR-3B', weight: 3.0, isBlocked: false },
  { fromNodeId: 'ROOM-309', toNodeId: 'CORRIDOR-3B', weight: 3.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-3A', toNodeId: 'STAIR-MAIN-F3', weight: 10.0, isBlocked: false },

  // ── FLOOR 4 CONNECTIONS ──
  { fromNodeId: 'ROOM-4-OR', toNodeId: 'CORRIDOR-4A', weight: 5.0, isBlocked: false },
  { fromNodeId: 'ROOM-4-WARD', toNodeId: 'CORRIDOR-4A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-4-AMPHITHEATER', toNodeId: 'CORRIDOR-4A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-4-CON', toNodeId: 'CORRIDOR-4A', weight: 4.0, isBlocked: false },
  { fromNodeId: 'ROOM-4-CNAHS', toNodeId: 'CORRIDOR-4A', weight: 6.0, isBlocked: false },
  { fromNodeId: 'ROOM-4-SKILLS', toNodeId: 'CORRIDOR-4A', weight: 5.0, isBlocked: false },
  { fromNodeId: 'CORRIDOR-4A', toNodeId: 'STAIR-MAIN-F4', weight: 8.0, isBlocked: false },

  // ── INTER-FLOOR STAIRCASE CONNECTIONS ──
  { fromNodeId: 'STAIR-MAIN-F1', toNodeId: 'STAIR-MAIN-F2', weight: 4.0, isBlocked: false },
  { fromNodeId: 'STAIR-MAIN-F2', toNodeId: 'STAIR-MAIN-F3', weight: 4.0, isBlocked: false },
  { fromNodeId: 'STAIR-MAIN-F3', toNodeId: 'STAIR-MAIN-F4', weight: 4.0, isBlocked: false },
  { fromNodeId: 'STAIR-FIRE-F1', toNodeId: 'STAIR-FIRE-F2', weight: 4.0, isBlocked: false },
];

const ngeAccessPoints = [
  { id: 'AP-NGE-1A', macAddress: '00:1a:2b:3c:4d:01', ssid: 'CITU_NGE_1F_East', floor: 1, x: 36.0, y: 17.5 },
  { id: 'AP-NGE-1B', macAddress: '00:1a:2b:3c:4d:02', ssid: 'CITU_NGE_1F_West', floor: 1, x: 8.0, y: 15.0 },
  { id: 'AP-NGE-2A', macAddress: '00:1a:2b:3c:4d:03', ssid: 'CITU_NGE_2F_East', floor: 2, x: 36.0, y: 17.5 },
  { id: 'AP-NGE-2B', macAddress: '00:1a:2b:3c:4d:04', ssid: 'CITU_NGE_2F_West', floor: 2, x: 8.0, y: 15.0 },
  { id: 'AP-NGE-3A', macAddress: '00:1a:2b:3c:4d:05', ssid: 'CITU_NGE_3F_North', floor: 3, x: 22.0, y: 5.0 },
  { id: 'AP-NGE-3B', macAddress: '00:1a:2b:3c:4d:06', ssid: 'CITU_NGE_3F_South', floor: 3, x: 22.0, y: 28.0 },
];

// SVG floor layout coordinates for the web dashboard map
const NGE_FLOOR_LAYOUTS = {
  1: {
    'ROOM-105': { x: 540, y: 55, color: '#3b82f6', label: 'Lab 105' },
    'ROOM-104': { x: 540, y: 125, color: '#3b82f6', label: 'Lab 104' },
    'ROOM-103': { x: 540, y: 195, color: '#3b82f6', label: 'Lab 103' },
    'ROOM-102': { x: 540, y: 265, color: '#3b82f6', label: 'Lab 102' },
    'ROOM-101': { x: 540, y: 335, color: '#3b82f6', label: 'Lab 101' },
    'ROOM-106': { x: 320, y: 55, color: '#8b5cf6', label: 'CCS Office (106)' },
    'ROOM-107': { x: 120, y: 175, color: '#8b5cf6', label: 'RDCO/ITSO (107)' },
    'ROOM-108': { x: 120, y: 305, color: '#8b5cf6', label: 'Case Room (108)' },
    'CORRIDOR-1A': { x: 330, y: 195, color: '#fbbf24', label: 'Main Hallway' },
    'STAIR-MAIN-F1': { x: 330, y: 390, color: '#f97316', label: 'Main Stairs ↕' },
    'STAIR-FIRE-F1': { x: 70, y: 55, color: '#f97316', label: 'Fire Exit ↕' },
    'EXIT-CIT-FIELD': { x: 50, y: 390, color: '#10b981', label: 'CIT Field ★' },
  },
  2: {
    'ROOM-205': { x: 540, y: 55, color: '#3b82f6', label: 'Lab 205' },
    'ROOM-204': { x: 540, y: 125, color: '#3b82f6', label: 'Lab 204' },
    'ROOM-203': { x: 540, y: 195, color: '#3b82f6', label: 'Lab 203' },
    'ROOM-202': { x: 540, y: 265, color: '#3b82f6', label: 'Lab 202' },
    'ROOM-201': { x: 540, y: 335, color: '#3b82f6', label: 'Lab 201' },
    'ROOM-206': { x: 320, y: 55, color: '#8b5cf6', label: 'Faculty Office (206)' },
    'ROOM-207': { x: 120, y: 195, color: '#8b5cf6', label: 'eLearning (207)' },
    'CORRIDOR-2A': { x: 330, y: 195, color: '#fbbf24', label: 'Main Hallway' },
    'STAIR-MAIN-F2': { x: 330, y: 390, color: '#f97316', label: 'Main Stairs ↕' },
    'STAIR-FIRE-F2': { x: 70, y: 55, color: '#f97316', label: 'Fire Exit ↕' },
  },
  3: {
    'ROOM-305': { x: 90, y: 55, color: '#3b82f6', label: 'Nursing 305' },
    'ROOM-304': { x: 210, y: 55, color: '#3b82f6', label: 'TSG Office (304)' },
    'ROOM-303': { x: 330, y: 55, color: '#3b82f6', label: 'Nursing 303' },
    'ROOM-302': { x: 450, y: 55, color: '#3b82f6', label: 'Nursing 302' },
    'ROOM-301': { x: 570, y: 55, color: '#3b82f6', label: 'Lecture 301' },
    'ROOM-306': { x: 90, y: 200, color: '#8b5cf6', label: 'TSG/NOC (306)' },
    'ROOM-307': { x: 210, y: 360, color: '#3b82f6', label: 'CNAHS Faculty (307)' },
    'ROOM-308': { x: 370, y: 360, color: '#3b82f6', label: 'Microbiology (308)' },
    'ROOM-309': { x: 530, y: 360, color: '#3b82f6', label: 'Anatomy Lab (309)' },
    'CORRIDOR-3A': { x: 330, y: 130, color: '#fbbf24', label: 'North Hallway' },
    'CORRIDOR-3B': { x: 330, y: 280, color: '#fbbf24', label: 'South Hallway' },
    'STAIR-MAIN-F3': { x: 60, y: 130, color: '#f97316', label: 'Main Stairs ↕' },
  },
  4: {
    'ROOM-4-OR': { x: 120, y: 70, color: '#ef4444', label: 'Operating Room' },
    'ROOM-4-WARD': { x: 350, y: 55, color: '#ef4444', label: 'Ward' },
    'ROOM-4-AMPHITHEATER': { x: 550, y: 55, color: '#8b5cf6', label: 'Amphitheater 1' },
    'ROOM-4-CON': { x: 120, y: 210, color: '#8b5cf6', label: 'College of Nursing' },
    'ROOM-4-CNAHS': { x: 220, y: 360, color: '#3b82f6', label: 'CNAHS Faculty' },
    'ROOM-4-SKILLS': { x: 450, y: 360, color: '#3b82f6', label: 'Nursing Skills Lab' },
    'CORRIDOR-4A': { x: 330, y: 200, color: '#fbbf24', label: 'Main Hallway' },
    'STAIR-MAIN-F4': { x: 60, y: 200, color: '#f97316', label: 'Main Stairs ↕' },
  }
};

const NGE_FLOOR_TITLES = {
  1: 'Ground Floor — Computer Studies Wing',
  2: '2nd Floor — Computer Labs & Faculty',
  3: '3rd Floor — Nursing & Technical Support',
  4: '4th Floor — Medical & Nursing Wing'
};

module.exports = { ngeRooms, ngeEdges, ngeAccessPoints, NGE_FLOOR_LAYOUTS, NGE_FLOOR_TITLES };
