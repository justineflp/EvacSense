const AccessPoint = require('../models/accessPointModel');
const Room = require('../models/roomModel');

/**
 * Triangulate coordinates using the Weighted Centroid Algorithm over scanned access points.
 * @param {Array<Object>} scans - List of AP readings: [{ macAddress: String, rssi: Number }]
 * @returns {Object|null} { x, y, floor } computed coordinate context, or null on failure
 */
async function triangulateRSSI(scans) {
  if (!scans || scans.length === 0) return null;

  try {
    // Filter scan inputs to resolve registered APs in our database
    const macs = scans.map(s => s.macAddress);
    const aps = await AccessPoint.findAll({
      where: { macAddress: macs }
    });

    if (aps.length === 0) return null;

    let sumX = 0;
    let sumY = 0;
    let sumWeights = 0;
    let computedFloor = aps[0].floor; // Default to the floor of detected APs

    for (const scan of scans) {
      const ap = aps.find(a => a.macAddress === scan.macAddress);
      if (!ap) continue;

      // Filter out extremely weak signals (below -85 dBm) to prevent coordinate inflation
      if (scan.rssi < -85) continue;

      // Weight calculation: conversion of negative RSSI decibels to linear power weight
      // Closer APs (e.g. -50 dBm) yield significantly larger weights than further ones (e.g. -80 dBm)
      const weight = Math.pow(10, (scan.rssi + 100) / 10); // Standard HSL baseline shifts for positive weights

      sumX += ap.x * weight;
      sumY += ap.y * weight;
      sumWeights += weight;
    }

    if (sumWeights === 0) return null;

    const x = sumX / sumWeights;
    const y = sumY / sumWeights;

    return { x, y, floor: computedFloor };

  } catch (error) {
    console.error('[TRIANGULATION ERROR] Triangulation process failed:', error);
    return null;
  }
}

/**
 * Match coordinates to a registered room zone based on floor coordinates boundaries.
 * @param {Number} x - Computed X coordinate
 * @param {Number} y - Computed Y coordinate
 * @param {Number} floor - Computed floor level
 * @returns {Object|null} Room record on match, else null
 */
async function matchRoom(x, y, floor) {
  try {
    const matchedRoom = await Room.findOne({
      where: {
        floor: floor
      }
    });
    
    // In local SQLite setups, we can fetch all rooms on the floor and do coordinate checks
    const rooms = await Room.findAll({ where: { floor } });
    
    for (const room of rooms) {
      if (x >= room.xMin && x <= room.xMax && y >= room.yMin && y <= room.yMax) {
        return room;
      }
    }
    
    return null;
  } catch (error) {
    console.error('[ROOM MATCHER ERROR] Room matching process failed:', error);
    return null;
  }
}

module.exports = {
  triangulateRSSI,
  matchRoom
};
