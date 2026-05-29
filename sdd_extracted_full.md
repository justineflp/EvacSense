CEBU INSTITUTE OF TECHNOLOGY

UNIVERSITY

COLLEGE OF COMPUTER STUDIES

Software Design Description

for

EvacSense

Change History Signature

| Version | Description | Date |
|---| ---| ---| 
| 1.0 | Initial Draft | May 23, 2026 |
| 1.1 | Version 1.1 | May 25, 2026 |
| 1.2 | Version 1.2 | May 26, 2026 |
| 1.3 | Version 1.3 | May 29, 2026 |

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
| LoginScreen | Entry point for all users; displays email/password fields and a "Register" option; routes to role-appropriate dashboard post-login | React Native Screen |
| LoginForm | Controlled form with validation for institutional email and password; shows inline errors for invalid credentials and "Account Pending Approval" state | React Native Component |
| RegisterScreen | Branching registration entry; displays role selector (Student, Teacher, Coordinator) and routes to the appropriate registration form | React Native Screen |
| StudentRegistrationForm | Collects full name, institutional email, student ID, and password; triggers device ID capture on submit; shows duplicate and validation errors | React Native Component |
| TeacherCoordinatorRegistrationForm | Collects full name, institutional email, employee ID, role selection, and password; submits for admin approval; displays "Pending Approval" confirmation | React Native Component |
| RegistrationRequestsPanel | Web dashboard view for Admin; lists all Pending Approval registration requests with user details; provides Approve and Reject actions | React.js Page Component |
| RejectionReasonModal | Modal that appears when Admin clicks Reject; requires a rejection reason before the submission can be confirmed | React.js Component |
| RoleRedirect | Post-login routing logic that reads the JWT role claim and navigates Admin/Coordinator to the Web Dashboard, Student/Teacher to the Mobile App Dashboard | React Native Navigation Hook |
| WebLoginPage | Web dashboard login equivalent for Coordinators and Admins; email/password fields with the same validation logic | React.js Page Component |
| AccountRecoveryScreen | Prompts user for institutional email; submits recovery request and displays success or failure feedback | React Native Screen |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| AuthController | Handles POST /api/auth/login; validates email and password credentials directly against the database; issues JWT on success; returns role and account status; rejects Pending Approval accounts with a dedicated error code | Node.js/Express Controller |
| MicrosoftTokenValidator | Captures and records the mobile device's unique identifier at registration time; returns an error if capture fails so registration is blocked until retry succeeds | Node.js Service Module |
| UserModel | ORM model for users table; fields: id, email, password_hash, role, employee_id, student_id, device_id, status (Active / Pending Approval / Rejected), created_at | Sequelize Model |
| DeviceIDCaptureService | Captures and records the mobile device's unique identifier at registration time; returns an error if capture fails so registration is blocked until retry succeeds | Node.js Service Module |
| StudentRegistrationController | Handles POST /api/auth/register/student; validates all fields, checks for duplicate email/student ID, captures device ID, creates account with role = Student and status = Active | Node.js/Express Controller |
| RegistrationApprovalController | Handles POST /api/auth/approve/:userId and POST /api/auth/reject/:userId; sets status = Active on approval or status = Rejected on rejection; requires a rejection reason on reject; sends notification to user in both cases | Node.js/Express Controller |
| RegistrationNotificationService | Sends push or email notification to Admin when a new Teacher/Coordinator registration request arrives; sends approval or rejection notification to the registrant upon Admin decision | Node.js Service Module |
| AccountRecoveryController | Handles POST /api/auth/recover; verifies email against registered accounts; dispatches a recovery email; returns a generic success response regardless of match to prevent account enumeration | Node.js/Express Controller |
| JWTService | Signs and verifies JSON Web Tokens using Microsoft Entra ID-issued identity as the claim source; sets 1-hour inactivity expiry; invalidates all sessions on logout | Node.js Service Module |
| RBACMiddleware | Express middleware that reads the JWT role claim and enforces route-level permissions; Admin and Coordinator routes are inaccessible to Student and Teacher roles | Node.js Middleware |
| SessionLogger | Logs all authentication events — login, logout, failed attempts, token rejections — with user ID, IP address, and timestamp for audit compliance under RA 10173 | Node.js Service Module |

.

.

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
| AmbiguousDetectionCard  | Shown when a weak-signal (ambiguous) detection occurs; displays the tentative classroom assignment, a "Low-confidence detection" icon, and a note that marshal confirmation is required at check-in | React Native Component |
| DrillActivationButton | Web table showing per-room headcount broken down by three detection statuses: Verified, Ambiguous (low-confidence), and Location-Unverified; displays the "Low-confidence detection" icon next to ambiguous entries | React.js Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| PresenceController | Receives room assignment submissions (both auto and manual); logs occupancy records to DB | Node.js Controller |
| WifiScanService | Reads RSSI data from campus access points; filters signals exclusively from device IDs registered in device_records (security NFR — unregistered devices are ignored); maps signal strength to room zones; implements automatic retry logic for intermittent connectivity | Node.js Service Module |
| RSSITriangulator | Applies weighted-centroid algorithm to multi-AP RSSI readings; returns a result object containing the room match AND a confidence classification: VERIFIED (above threshold), AMBIGUOUS (weak but active signal from adjacent room/hallway), or UNREACHABLE (device not detected) | Node.js Service Module |
| ClassroomMatcher | Maps triangulated position to room_id using floor plan graph data stored in the database | Node.js Service Module |
| OccupancyModel | ORM model for classroom_occupancy table; fields: id, drill_id, user_id, room_id, detection_confidence (VERIFIED / AMBIGUOUS / UNVERIFIED), rssi_value, navigation_origin_set, marshal_confirmed, detected_at | Sequelize Model |
| PresenceBroadcaster | Publishes occupancy updates (including confidence levels) to Redis Pub/Sub for real-time dashboard sync; must deliver the classroom presence list to the Safety Officer dashboard within 5 seconds of drill activation | Node.js Service Module |
| DrillSessionController  | Handles POST /api/drill/activate; validates Safety Officer role; sets drill session to Active in the database; triggers WifiScanService to begin the classroom detection sweep across all registered devices | Node.js/Express Controller |
| UnverifiedFlagService  | After the scan sweep completes, cross-references all registered students against the occupancy results; marks any student with no detection record as UNVERIFIED and sets navigation_origin_set = false; these students are surfaced for manual follow-up in Module 4 | Node.js Service Module |

Object-Oriented Components

### Module 3 - Shortest-Path Evacuation Navigation

#### Display Evacuation Route

#### 

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| NavigationScreen | Main screen showing floor plan map and turn-by-turn directions | React Native Screen |
| FloorPlanRenderer | Renders SVG-based floor plan with the computed route path overlaid | React Native SVG Component |
| DirectionCard | Bottom card showing current instruction, ETA, and distance | React Native Component |
| RouteCache  | Stores the last successfully received route payload in local device storage immediately upon delivery; serves the cached static route to FloorPlanRenderer and DirectionCard when the network connection drops, ensuring navigation remains visible offline | React Native Local Storage Module |
| OfflineStatusBanner | Displays a persistent banner notifying the student that real-time updates are paused due to a lost network connection; auto-dismisses when connectivity is restored and live updates resume | React Native Component |
| ManualOriginPicker | Dropdown presented when Wi-Fi RSSI cannot detect the student's location at navigation start (weak signal fallback specific to Module 3); allows the student to manually select their current room before the route is computed | React Native Component |
| RouteUpdateBanner | Animated yellow banner that appears when a dynamically recomputed route is pushed via WebSocket due to a blocked path; prompts the student to follow the new route | React Native Component |
| DynamicFloorPlan | Re-renders the route overlay when a new path is received; draws the previously active path in red to indicate the blockage and the new path in the standard route color | React Native SVG Component |
| DefaultExitAlert  | Alert dialog shown when no valid route is found due to a configuration error; directs the student to the nearest pre-configured default safe exit | React Native Component |
| RouteConfigPage | Web dashboard page where the Drill Coordinator maps rooms, corridors, exits, and staircases onto the interactive floor plan to configure valid evacuation pathways before a drill | React.js Page Component |
| FloorPlanEditor | Interactive canvas within RouteConfigPage; allows the Coordinator to select nodes (rooms, corridors, exits, staircases) and connect them with edges to define the evacuation graph; visualizes connectivity errors flagged by the validator | React.js Component |
| RouteConflictPanel  | Shown when RouteValidationService detects duplicate, dead-end, or conflicting routes during save; lists the specific conflicts and highlights the affected nodes on the floor plan for the Coordinator to resolve | React.js Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| PathfindingService | Python/Flask service; receives start node and destination; runs Dijkstra's on floor plan graph | Python Flask API |
| GraphLoader | Loads the campus floor plan graph (nodes = rooms/corridors/exits/staircases, edges = passageways with distance weights) from PostgreSQL into memory for pathfinding; reloads when the Coordinator saves a new configuration | Python Module |
| RouteSerializer | Converts the computed path (list of node IDs) into a structured turn-by-turn instruction set and caches the full route payload for delivery to the mobile client | Python Module |
| RouteConfigController | Handles POST /api/nav/config; receives the floor plan graph payload from the Coordinator; calls RouteValidationService before persisting; returns conflict details if validation fails; confirms successful save | Node.js/Express Controller |
| RouteValidationService | Validates the submitted evacuation graph for dead ends, disconnected nodes, duplicate edges, and unreachable assembly areas before the configuration is saved; returns a structured list of conflicts if any are found | Node.js Service Module |
| NavigationController | Handles POST /api/nav/route; receives the student's origin node (from Module 2 occupancy record or manual selection) and assembly area destination; calls PathfindingService; returns the serialized route payload; logs the navigation origin and route to navigation_logs | Node.js/Express Controller |
| BlockageController | Handles POST /api/nav/block from the Coordinator dashboard; marks the specified edge as blocked in the database; triggers RouteRecomputeService | Node.js Controller |
| RouteSocketBroadcaster | Pushes updated route payloads to affected students via Socket.IO room channels; also broadcasts the OfflineStatusBanner dismissal signal when a reconnected student's cached route is confirmed still valid | Node.js/Socket.IO Module |
| NavigationLogModel | ORM model for navigation_logs table; fields: id, drill_id, user_id, origin_node_id, destination_node_id, route_payload, origin_source (MODULE2_VERIFIED / MODULE2_AMBIGUOUS / MANUAL), computed_at, delivered_at | Sequelize Model |
| GraphModel  | ORM model for evacuation_graph_nodes and evacuation_graph_edges tables; nodes carry type (ROOM, CORRIDOR, STAIRCASE, EXIT, ASSEMBLY_AREA) and floor; edges carry distance weight and a blocked flag | Sequelize Model |

Object-Oriented Components

Data Design

### Module 4 - Evacuation Area Attendance and Authentication

#### 4.1 Evacuee Arrival Confirmation

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ArrivalDetectionCard | Displays Wi-Fi arrival status; shows AP name, RSSI value, and auto-detection confirmation | React Native Component |
| ManualArrivalButton | Shown when Wi-Fi auto-detection fails; allows the student to manually tap "I Have Arrived" to force-trigger the Student ID input step and bypass automatic detection | React Native Component |
| StudentIDVerifier | Displays validated student ID and name after database lookup | React Native Component |
| FaceRecognitionCapture | Opens caOpens camera viewfinder for live photo capture; handles up to 3 retry attempts; displays confidence score; flags for manual marshal verification after 3 consecutive failures; confidence threshold updated to 85% (was 95%)mera viewfinder; handles capture, retry (max 3 attempts), and displays confidence score | React Native Component |
| PeerAttendancePanel | Companion flow: allows a Companion to input a classmate's Student ID, validate it, then trigger FaceRecognitionCapture for biometric verification; on success logs attendance as "Present (Peer-Assisted)"; displays "ID Not Found" error on invalid ID | React Native Component |
| LocalArrivalQueue | Queues the student's arrival timestamp and check-in payload locally when the network drops at the moment of arrival; displays an "Offline — syncing when reconnected" indicator; auto-syncs to backend upon connection restoration | React Native Local Storage Module |
| CompleteCheckInButton | Finalizes the check-in process and submits all verified data to the backend | React Native Component |
| DistressButton | Sends an immediate distress alert with the student's ID, last known location, and timestamp to the Safety Officer dashboard; if offline, caches the alert locally and aggressively retransmits in the background once connection is restored | React Native Component |
| MissingPersonAlert | Displays a banner showing how many students have not checked in past the target evacuation time | React Native Component |

Back-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| ArrivalDetectionController | Detects student arrival at assembly area Wi-Fi zone; POST /api/checkin/detect | Node.js Controller |
| StudentIDValidator | Queries the database to validate the student ID and check enrollment status and active flag | Node.js Service Module |
| FaceRecognitionService | Calls TensorFlow.js or AWS Rekognition; requires a confidence score of at least 85% (updated from 95%) for an automatic match; prompts retry up to 3 attempts; flags the student for manual marshal verification after 3 consecutive failures; used by both direct arrival and peer-assist flows via <> | Node.js Service Module |
| PeerPhotoProcessor | Handles POST /api/checkin/peer; receives Companion's submitted Student ID and photo; validates the ID via StudentIDValidator; calls FaceRecognitionService; on verification success logs attendance as "Present (Peer-Assisted)"; on ID not found returns error to Companion | Node.js Service Module |
| AttendanceLogger | Logs the final arrival record to drill_attendance with: timestamp, check-in method (WIFI_AUTO / MANUAL_ARRIVAL / PEER_ASSISTED), face recognition confidence score, zone, verified status, and marshal_required flag; must persist to DB within 2 seconds per Performance NFR | Node.js Service Module |
| OfflineArrivalSyncService  | Handles POST /api/checkin/sync; receives queued arrival payloads from LocalArrivalQueue when the student reconnects; validates timestamp integrity and deduplicates against existing records before writing to drill_attendance | Node.js Service Module |
| DistressAlertBroadcaster | Handles POST /api/alert/distress; immediately logs the distress signal (student ID, last known location, timestamp) to distress_alerts; publishes via Redis Pub/Sub to SafetyOfficerDashboardSocket; also accepts offline-cached alert payloads transmitted by LocalArrivalQueue on reconnection | Node.js Service Module |
| SafetyOfficerDashboardSocket | WebSocket channel dedicated to Safety Officer; receives distress alerts and missing person flags in real time | Node.js/Socket.IO Module |
| AttendanceModel | ORM model for drill_attendance table; fields: id, drill_id, user_id, zone_id, checkin_method (WIFI_AUTO / MANUAL_ARRIVAL / PEER_ASSISTED), face_confidence, verified_status (VERIFIED / PEER_ASSISTED / MARSHAL_REQUIRED), marshal_required, arrived_at, synced_at | Sequelize Model |
| DistressAlertModel | ORM model for distress_alerts table; fields: id, drill_id, user_id, last_known_location, triggered_at, transmitted_at (nullable — null if still queued offline), resolved | Sequelize Model |

Object-Oriented Components

Data Design

### Module 5 Post-Drill Monitoring and Real-Time Reporting

#### 

#### 

#### 5.1 Live Drill Dashboard

Front-end component(s)

| Component Name | Description and Purpose | Type/Format |
|---| ---| ---| 
| LiveDashboard | Main Drill Coordinator view; subscribes to the Coordinator WebSocket channel for real-time drill progress updates; distinct from the Safety Officer's SafetyOfficerDashboard in Module 4.2 — these are separate actors with separate dashboard interfaces  | React.js Page |
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
| ReportController | Handles POST /api/reports/generate/:drillId; compiles the complete drill evaluation report by reading from the following cross-module tables: classroom_occupancy (Module 2 — pre-drill presence baseline and detection confidence), navigation_logs (Module 3 — per-student route origin, destination, computed_at, and delivered_at for bottleneck analysis), drill_attendance (Module 4.1 — arrival timestamps, check-in method, face confidence scores), missing_person_flags (Module 4.2 — unaccounted students list), distress_alerts (Module 4.2 — distress event log with triggered_at and transmitted_at); only executable when drill_sessions.status = concluded  | Node.js Controller |
| PDFExporter | Uses PDFKit to produce formatted downloadable report with drill summary, floor analysis, and key metrics | Node.js Service Module |
| CSVExporter | Serializes attendance and timing data to CSV format with delimited matrix rows | Node.js Service Module |

Object-Oriented Components