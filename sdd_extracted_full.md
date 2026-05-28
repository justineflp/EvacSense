CEBU INSTITUTE OF TECHNOLOGY

UNIVERSITY

COLLEGE OF COMPUTER STUDIES

Software Design Description

for

EvacSense

Change History Signature

Preface

___

Table of Contents

1.Introduction6

1.1.Purpose6

1.2.Scope6

1.3.Definitions and Acronyms6

1.4.References6

2.Architectural Design 7

3.Detailed Design8

Module 18

Module 212

Module 322

Module 433

Module 537

# Introduction

## Purpose

This Software Design Description (SDD) delineates the architectural and detailed design frameworks for EvacSense, an integrated web and mobile platform engineered to facilitate earthquake drill attendance tracking, navigational guidance, and real-time reporting within Philippine educational facilities. This document serves as a technical specification for developers, architects, and relevant stakeholders, providing the necessary design blueprints for the implementation of the system's five core modules.

## Scope

This SDD covers the design of the complete EvacSense system including:

Module 1: User Authentication System

Module 2: Classroom Presence Recording

Module 3: Shortest-Path Evacuation Navigation

Module 4: Evacuation Area Attendance and Authentication

Module 5: Post-Drill Monitoring and Real-Time Reporting

The document includes architectural design, detailed component design for each module, class diagrams, sequence diagrams, database schemas, and API specifications.

## Definitions and Acronyms

RSSI -Received Signal Strength Indicator; Wi-Fi signal measurement

JWT - JSON Web Token; stateless authentication mechanism

API - Application Programming Interface

UI/UX - User Interface / User Experience

ERD - Entity Relationship Diagram; database schema visualization

2FA- Two-Factor Authentication (Student ID + Face Recognition)

MVP - Minimum Viable Product

## References

EvacSense Project Proposal (May 2026)

Software Requirements Specification (SRS) v1.0

IEEE Std 1016-2009 — Standard for Information and Description of Software Design

React Native Documentation: https://reactnative.dev/

Node.js/Express Documentation: https://nodejs.org/

PostgreSQL Documentation: https://www.postgresql.org/docs/

# Architectural Design

# Detailed Design

### Module 1 - User Authentication System

#### 1.1 User Login and Role-Based Access

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| LoginScreen | Entry point for all users; collects credentials and submits to auth API | React Native Screen |
| LoginForm | Controlled form with validation for email and password fields | React Native Component |
| RoleRedirect | Post-login logic that reads JWT role claim and routes the user | React Native Navigation Hook |
| WebLoginPage | Web dashboard login equivalent for coordinators and admins | React.js Page Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| AuthController | Handles POST /api/auth/login; validates credentials, issues JWT | Node.js/Express Controller |
| UserModel | ORM model for users table; fields: id, email, password_hash, role, created_at | Sequelize Model |
| JWTService | Signs and verifies JSON Web Tokens; sets 1-hour expiry; invalidates on logout | Node.js Service Module |
| RBACMiddleware | Express middleware that checks JWT role claim against route permission table | Node.js Middleware |
| SessionLogger | Logs all authentication events (login, logout, failed attempts) with timestamps | Node.js Service Module |

### Module 2 - Classroom Presence Recording

#### 2.1 Record Pre-Drill Classroom Occupancy

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| PresenceScreen | Displays current detection status and room assignment to the student after drill is activated | React Native Screen |
| WifiDetectionScreen | Polls backend for Wi-Fi scan status; shows radar animation during active RSSI scan | React Native Screen |
| LocationConfirmCard | Displays confirmed room name and floor after successful Wi-Fi detection | React Native Component |
| ManualRoomEntry | Fallback form allowing the student to manually select their classroom from a dropdown if Wi-Fi detection fails | React Native Component |
| OccupancyDashboard | Web table showing per-room headcount broken down by detection method and status; visible to Safety Officer | React.js Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| PresenceController | Receives room assignment submissions (both auto and manual); logs occupancy records to DB | Node.js Controller |
| WifiScanService | Reads RSSI data from campus access points; maps signal strength readings to room zones | Node.js Service Module |
| RSSITriangulator | Applies weighted-centroid algorithm to multi-AP RSSI readings to determine the student's room | Node.js Service Module |
| ClassroomMatcher | Maps triangulated position to room_id using floor plan graph data stored in the database | Node.js Service Module |
| OccupancyModel | ORM model for the classroom_occupancy table; handles create, read, and flag operations | Sequelize Model |
| PresenceBroadcaster | Publishes occupancy updates to Redis Pub/Sub for real-time dashboard sync on drill activation | Node.js Service Module |

Object-Oriented Components

Data Design

.

### Module 3 - Shortest-Path Evacuation Navigation

#### Display Evacuation Route

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| NavigationScreen | Main screen showing floor plan map and turn-by-turn directions | React Native Screen |
| FloorPlanRenderer | Renders SVG-based floor plan with the computed route path overlaid | React Native SVG Component |
| DirectionCard | Bottom card showing current instruction, ETA, and distance | React Native Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| PathfindingService | Python/Flask service; receives start node and destination; runs Dijkstra's on floor plan graph | Python Flask API |
| GraphLoader | Loads campus floor plan graph (nodes = rooms/corridors, edges = passageways with weights) from PostgreSQL | Python Module |
| RouteSerializer | Converts computed path (list of node IDs) into turn-by-turn instruction set | Python Module |

Object-Oriented Components

Sequence Diagram

Data Design

#### 3.2 Dynamic Route Updates

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| RouteUpdateBanner | Animated yellow banner that appears when a new route is pushed via WebSocket | React Native Component |
| DynamicFloorPlan | Re-renders the route overlay when a new path is received; shows blocked path in red | React Native SVG Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| BlockageController | Accepts POST /api/nav/block from coordinator dashboard; marks edge as blocked in DB | Node.js Controller |
| RouteRecomputeService | On blockage event, fetches all active users on affected paths and recomputes routes | Node.js Service Module |
| RouteSocketBroadcaster | Pushes updated route payload to affected users via Socket.IO room channels | Node.js/Socket.IO Module |

Object-Oriented Components

Sequence Diagram

### Module 4 - Evacuation Area Attendance and Authentication

#### 4.1 Evacuee Arrival Confirmation

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ArrivalDetectionCard | Displays Wi-Fi arrival status; shows AP name, RSSI value, and auto-detection confirmation | React Native Component |
| StudentIDVerifier | Displays validated student ID and name after database lookup | React Native Component |
| FaceRecognitionCapture | Opens camera viewfinder; handles capture, retry (max 3 attempts), and displays confidence score | React Native Component |
| PeerAttendancePanel | Allows a Companion to photograph a classmate without a device; submits for marshal confirmation | React Native Component |
| CompleteCheckInButton | Finalizes the check-in process and submits all verified data to the backend | React Native Component |
| DistressButton | Sends an immediate distress alert with student name and last known location to the Safety Officer dashboard | React Native Component |
| MissingPersonAlert | Displays a banner showing how many students have not checked in past the target evacuation time | React Native Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ArrivalDetectionController | Detects student arrival at assembly area Wi-Fi zone; POST /api/checkin/detect | Node.js Controller |
| StudentIDValidator | Queries the database to validate the student ID and check enrollment status and active flag | Node.js Service Module |
| FaceRecognitionService | Calls TensorFlow.js/AWS Rekognition; requires confidence >= 95% for automatic match; flags for manual verification if below threshold or after 3 failed attempts | Node.js Service Module |
| PeerPhotoProcessor | Receives peer-submitted photo; queues it for marshal confirmation before marking the absent student as present | Node.js Service Module |
| AttendanceLogger | Logs arrival record with timestamp, method (Wi-Fi/face/peer), zone, and verified status to drill_attendance table | Node.js Service Module |
| DistressAlertBroadcaster | On distress button press, immediately publishes student name and last known location via Redis Pub/Sub to Safety Officer dashboard via WebSocket | Node.js Service Module |
| SafetyOfficerDashboardSocket | WebSocket channel dedicated to Safety Officer; receives distress alerts and missing person flags in real time | Node.js/Socket.IO Module |

Object-Oriented Components

Data Design

### Module 5 Post-Drill Monitoring and Real-Time Reporting

#### 5.1 Live Drill Dashboard

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| LiveDashboard | Main coordinator view; subscribes to WebSocket channel for real-time updates | React.js Page |
| BuildingStatusPanel | Per-floor occupancy counts and clearance status with color-coded progress bars | React.js Component |
| AssemblyAreaPanel | Per-zone assigned vs. arrived counts with percentage and progress bar | React.js Component |
| DrillSummaryCard | Summary statistics showing total occupants, evacuated, not arrived, and progress | React.js Component |
| MissingStudentsList | Isolates unaccounted students for rapid manual triage by the coordinator | React.js Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| DashboardController | GET /api/dashboard/:drillId; returns full drill snapshot | Node.js Controller |
| WebSocketServer | Socket.IO server; broadcasts headcount and status updates every 5 seconds or on event | Node.js/Socket.IO |
| DrillStateService | Maintains in-memory drill state; reconciles DB writes with live event stream | Node.js Service Module |

Object-Oriented Components

Data Design

#### 5.2 Post-Drill Report Generation

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ReportPreview | Displays compiled post-drill report in a readable format before export | React.js Component |
| FloorAnalysisTable | Per-floor table showing status (Cleared/Issues/Incomplete) and clear time | React.js Component |
| KeyMetricsPanel | Summary panel showing total occupants, evacuated, not checked in, and bottlenecks | React.js Component |
| ExportButtons | Triggers PDF or CSV download of the compiled report | React.js Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ReportController | POST /api/reports/generate/:drillId; compiles all drill data into report object | Node.js Controller |
| PDFExporter | Uses PDFKit to produce formatted downloadable report with drill summary, floor analysis, and key metrics | Node.js Service Module |
| CSVExporter | Serializes attendance and timing data to CSV format with delimited matrix rows | Node.js Service Module |

Object-Oriented Components