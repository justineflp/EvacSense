COLLEGE OF COMPUTER STUDIES

Software Requirements Specifications

for

EVACSENSE

Change History

| Version | Description | Date |
|---| ---| ---| 
| 1.0 | Initial Draft | May 23, 2026 |
| 1.1 | Version 1.1 | May 25, 2026 |
| 1.2 | Version 1.2 | May 26, 2026 |
| 1.3 | Version 1.3 | May 29, 2026 |

Table of Contents

Change History2

Table of Contents3

1.Introduction4

1.1.Purpose4

1.2.Scope4

1.3.Definitions, Acronyms and Abbreviations4

1.4.References4

2.Overall Description5

2.1.Product perspective5

2.2.User characteristics5

2.4. Constraints5

2.5. Assumptions and dependencies6

3.Specific Requirements7

3.1.External interface requirements7

3.1.1.Hardware interfaces7

3.1.2.Software interfaces7

3.1.3.Communications interfaces7

3.2.Functional requirements7

Module 17

Module 28

3.4Non-functional requirements8

Performance8

Security8

Reliability8

# Introduction

## Purpose 

The purpose of this document is to provide a detailed description of the EvacSense system, a Wi-Fi and Sensor-Based Evacuation Attendance and Navigation System for Earthquake Drills that integrates real-time presence logging and navigation routing. This document serves as a reference for developers, project managers, and stakeholders to ensure alignment with functional and non-functional requirements. 

## Scope

EvacSense is a web and mobile-based application designed to help institutions plan, execute, and evaluate earthquake drill safety workflows. The system ensures that every student, teacher, and staff member evacuates safely and is accurately accounted for at the designated assembly area.

The system encompasses the following core functionalities:

•        Classroom Presence Recording — automatic detection and logging of occupants present in classrooms before evacuation begins.

•        Shortest-Path Evacuation Navigation — real-time dynamic routing that directs evacuees along the safest and fastest path to the assembly area.

•        Evacuation Area Attendance and Authentication — verification and recording of evacuee arrivals at the assembly point using sensor-based or Wi-Fi-based authentication.

•        Post-Drill Monitoring and Real-Time Reporting — dashboards and reports providing drill coordinators with live updates and post-drill analytics.

•        User Authentication System — secure login and role-based access for administrators, teachers, and staff.

## Definitions, Acronyms and Abbreviations

. 

Wi-Fi - Wireless Fidelity; the wireless networking technology used for indoor presence detection.

RSSI - Received Signal Strength Indicator; used for Wi-Fi-based indoor positioning. 

API - Application Programming Interface; used for communication between system components 

UI - User Interface. 

Admin -Administrator; a user role with full system access. 

Assembly Area - The designated safe zone where evacuees gather during a drill. 

Safety Officer (also referred to as Drill Coordinator): The primary administrator responsible for configuring the system, activating drill sessions, and monitoring the live dashboard. 

## References

 IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications.

 National Disaster Risk Reduction and Management Council (NDRRMC) — Guidelines on Earthquake Drill Protocols in Educational Institutions.

Philippine Institute of Volcanology and Seismology (PHIVOLCS) — Earthquake Safety Guidelines.

React Native Documentation — https://reactnative.dev/docs/getting-started

 Firebase Realtime Database Documentation — https://firebase.google.com/docs/database

   IEEE 802.11 Wi-Fi Standards for indoor positioning and RSSI-based localization.

# Overall Description

## Product perspective

EvacSense is a standalone web and mobile application that interfaces with institutional Wi-Fi infrastructure and IoT sensors to deliver real-time evacuation management. The system operates within a client-server architecture:

•        Mobile Application — used by students, teachers, and staff for navigation and attendance confirmation during drills.

•        Web Dashboard — used by drill coordinators and administrators for monitoring, reporting, and system configuration.

•        Backend Server — manages authentication, data processing, shortest-path computation, and real-time data synchronization.

•       Mobile Sensors and Wi-Fi Layer —Existing campus Wi-Fi access points provide the RSSI-based indoor positioning data, while the mobile device's built-in camera acts as the primary sensor for capturing images used in face recognition and peer-assisted attendance. 

EvacSense does not replace existing emergency alarm systems but operates alongside them as a data-driven accountability and navigation layer.

## User characteristics

The system is intended for the following user groups:

•        Students — use the mobile app to receive evacuation route guidance and confirm their arrival at the assembly area. Expected to have basic smartphone proficiency.

            •        Teachers and Staff — use the mobile app to record classroom occupancy before evacuation and confirm their group's safe arrival. Moderate familiarity with mobile apps expected.

•        Drill Coordinators / Administrators — use the web dashboard to configure drills, monitor real-time evacuation progress, and generate post-drill reports. Expected to have intermediate computer literacy.

•        System Administrators — manage user accounts, device configurations, and system settings. Expected to have technical proficiency.

## 2.4. Constraints

 The following constraints apply to the development and operation of EvacSense:

•        Regulatory: The system must comply with the Philippine Data Privacy Act (RA 10173) regarding the collection and storage of student and personnel data.

•        Hardware Limitations: Accuracy of Wi-Fi-based presence detection is dependent on the density and placement of campus Wi-Fi access points. Performance may degrade in areas with poor Wi-Fi coverage.

•        Network Dependency: Real-time features require active Wi-Fi or mobile data connectivity. 

•        Device Compatibility: The mobile application must support Android 8.0 and above and iOS 13 and above.

•        Concurrent Users: The system must support simultaneous use by all campus occupants during a drill (estimated up to 2,000 concurrent users for a medium-sized institution).

•        Drill Scheduling: The system is designed for scheduled drill events, not continuous real-time emergency monitoring.

•        Safety Criticality: As the system is used in simulated emergency scenarios, any failure in navigation or attendance recording must be handled gracefully with clear error messages and fallback procedures.

• Network Degradation & Error Handling: Real-time dynamic routing and live attendance require active connectivity. In the event of a sudden network drop during a drill, the mobile application must gracefully notify the user of the offline status rather than crashing, and pause real-time location updates until the connection is restored. 

## 2.5. Assumptions and dependencies

•        It is assumed that the institution has an existing Wi-Fi infrastructure with sufficient access point coverage across all buildings and corridors.

•        It is assumed that all students and staff have access to a compatible smartphone device during drills.

•        The system depends on a reliable backend server (cloud-hosted or on-premises) with a minimum uptime of 99.5% during drill operations.

•        Floor plan data (building maps, room locations, exit points) will be provided by the institution prior to system deployment.

•        It is assumed that drill coordinators will conduct at least one system configuration and test run before an actual drill.

•        The system depends on third-party mapping or graph libraries for pathfinding computation.

# Specific Requirements 

## External interface requirements

### 3.1.1.Hardware interfaces

EvacSense interfaces with the following hardware components:

•        Campus Wi-Fi Access Points — the system reads RSSI data from existing 802.11 b/g/n/ac access points for occupancy detection. No modifications to access point hardware are required.

•        Mobile Devices (Android/iOS) — used by occupants for navigation and attendance confirmation. Must have Wi-Fi and GPS capability.

•        Server Hardware — a dedicated server or cloud instance with minimum 4-core CPU, 8 GB RAM, and 100 GB SSD storage for hosting backend services.

•     Mobile Device Cameras — Utilized by the student or a peer companion to capture live photos for face recognition and identity verification upon arriving at the evacuation assembly area. 

### 3.1.2.Software interfaces

•        Operating Systems: Backend server running Ubuntu Server 22.04 LTS or equivalent. Mobile app supporting Android 8.0+ and iOS 13+.

•        Database: Firebase Realtime Database or PostgreSQL for storing user data, drill records, sensor readings, and attendance logs.

•        Pathfinding Library: Dijkstra's or A* algorithm implementation (e.g., via a graph library such as NetworkX for Python or a JS equivalent) for computing shortest evacuation routes

             •        Photo-Based Mapping & Navigation Interface: A panorama or image-rendering library (e.g.,                     ReactPhoto Sphere Viewer, Marzipano, or customized image overlays). 

•        Push Notification Service: Firebase Cloud Messaging (FCM) for sending real-time alerts and drill initiation notifications to mobile devices.. 

•        Authentication: JSON Web Tokens (JWT) for session management; integration with Microsoft Outlook-based institutional accounts through Microsoft Authentication / Microsoft Entra ID for Single Sign-On.

### 3.1.3.Communications interfaces

•        Wi-Fi (IEEE 802.11) — primary communication channel for mobile app connectivity, RSSI-based presence detection, and real-time data transmission.

•        HTTPS/REST API — all communication between the mobile/web client and the backend server uses encrypted HTTPS connections with RESTful API endpoints.

•        WebSockets — used for real-time live updates on the drill coordinator dashboard (e.g., live headcount, evacuation progress).

•     Multipart/Form-Data via HTTPS — Used specifically for securely packaging and transmitting high-resolution captured photos from the mobile application to the backend server for face recognition processing. 

•        FCM (Firebase Cloud Messaging) — for push notifications to mobile devices.

## Functional requirements

### Module 1 : User Authentication System

1.1 User Login and Role-Based Access

##### 

##### Use Case Diagram :

##### 

##### 

##### Use Case Description :

| Use Case Name | Register Student Account  |
|---| ---| 
| Actors | Student  |
| Goal | Allow a student to independently register an account in EvacSense before logging in.  |
| Preconditions | 1. Student has a valid institutional email.  2. Internet connection is available.  3. Student has not previously registered.  |
| Main Flow | 1. Student opens the EvacSense application.  2. Student selects "Register" on the login screen.  3. System displays the Student registration form.  4. Student enters full name, institutional email, student ID number, and creates a password.  5. System automatically captures and records the student's device ID.  6. Student submits the registration form.  7. System validates all fields and checks for duplicate accounts.  8. System creates the account with role = Student and status = Active.  9. System notifies the student that registration is successful and prompts them to log in.  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Duplicate Account (from Step 7): If the system detects an existing account with the same email or student ID, the system displays a duplicate account error and halts registration.  A2. Device ID Capture Failure (from Step 5): If the system fails to capture the device ID, the system displays an error and prompts the student to retry before proceeding.  A3. Invalid Field Entry (from Step 7): If any submitted field fails validation, the system highlights the invalid fields and prompts the student to correct them before resubmitting.  |
| Postconditions | 1. Student account is created and linked to their device ID.  2. Student can immediately log in.  |

| Use Case Name | Register Teacher / Coordinator Account  |
|---| ---| 
| Actors | Teacher, Coordinator  |
| Secondary Actor | Admin / Provider  |
| Goal | Allow a teacher or coordinator to submit a registration request that requires admin approval before account activation.  |
| Preconditions | 1. User has a valid institutional email.  2. Internet connection is available.  3. User has not previously registered.  |
| Main Flow | 1. User opens the EvacSense application and selects "Register."  2. System displays the registration form.  3. User selects their role (Teacher or Coordinator) from a dropdown.  4. User enters full name, institutional email, employee ID, and creates a password.  5. System automatically captures and records the user's device ID.  6. User submits the registration form.  7. System validates all fields and checks for duplicate accounts.  8. System creates the account with status = Pending Approval.  9. System sends a registration request notification to the Admin for review.  10. System notifies the user that their registration is pending approval. .  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Duplicate Account (from Step 7): If the system detects an existing account with the same email or employee ID, the system displays a duplicate account error and halts registration.  A2. Device ID Capture Failure (from Step 5): If the system fails to capture the device ID, the system displays an error and prompts the user to retry before proceeding.  A3. Invalid Field Entry (from Step 7): If any submitted field fails validation, the system highlights the invalid fields and prompts the user to correct them before resubmitting.  A4. Admin Rejects Request (from Step 9): If the Admin rejects the registration request, the system notifies the user of the rejection along with the provided reason, and the account remains inactive.  |
| Postconditions | 1. Registration request is stored with status = Pending Approval.  2. Admin receives a notification to review the request.  3. User cannot log in until the account is approved.   |

| Use Case Name | Approve or Reject Registration Request  |
|---| ---| 
| Actors | Admin / Provider  |
| Goal | Allow the admin to review, approve, or reject pending Teacher and Coordinator registration requests.  |
| Preconditions | 1. Admin is authenticated and logged into the web dashboard.  2. At least one registration request has status = Pending Approval.   |
| Main Flow | 1. Admin opens the Registration Requests panel on the web dashboard.  2. System displays the list of pending registration requests with user details.  3. Admin selects a registration request to review.  4. Admin reviews the submitted user information.  5. Admin clicks "Approve" or "Reject."  6. System activates the account (status = Active) and notifies the user of approval.  7. System sends a confirmation notification to the approved user.  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. No Pending Requests (from Step 2): If no pending requests exist, the system displays a "No Pending Requests" message and the admin cannot proceed further.  A2. Admin Selects Reject (from Step 5): If the admin clicks "Reject," the system prompts the admin to enter a rejection reason. Once submitted, the system sets the request status to Rejected and notifies the user with the provided reason.  A3. Rejection Submitted Without Reason (from Step 5): If the admin attempts to confirm a rejection without entering a reason, the system blocks submission and prompts the admin to provide one before proceeding. .  |
| Postconditions | 1. Approved: User account is activated and the user can log in.  2. Rejected: Registration request is closed and the user is notified with the reason.  |

| Use Case Name | Login with Institutional Account  |
|---| ---| 
| Actors | Student, Teacher, Coordinator, Admin  |
| Secondary Actor | Authentication Service  |
| Goal | Allow registered and approved users to securely log in to EvacSense using their institutional credentials.  |
| Preconditions | 1. User has a registered and active EvacSense account.  2. Internet connection is available.  3. Authentication Service is operational.    |
| Main Flow | 1. User opens the EvacSense application.  2. System displays the login screen.  3. User enters their institutional email and password.  4. System submits credentials to the Authentication Service.  5. Authentication Service verifies the credentials.  6. System receives the authentication token.  7. System validates the token and retrieves the user's role and account status. 8. If the user is an Admin or Coordinator, the system redirects to the Web Dashboard.  9. If the user is a Student or Teacher, the system redirects to the Mobile App Dashboard.  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Invalid Credentials (from Step 5): If the Authentication Service fails to verify the credentials, the system displays a login error message and returns the user to the login screen.  A2. Account Pending Approval (from Step 7): If the system retrieves the account and finds its status is Pending Approval, the system displays an "Account pending admin approval" message and denies access. A3. User Cancels Login (from Step 3): If the user cancels before submitting credentials, the system returns to the login screen without processing. .  |
| Postconditions | 1. Admin and Coordinator users successfully access the Web Dashboard.  2. Student and Teacher users successfully access the Mobile App Dashboard. 3. User session is established securely.  |

| Use Case Name | Recover Account Access |
|---| ---| 
| Actors | Student, Teacher, Coordinator, Admin  |
| Goal | Allow any registered user to recover access to their account if they are unable to log in.  |
| Preconditions | 1. User has an existing registered account.  2. Internet connection is available.  |
| Main Flow | 1. User selects "Recover Account Access" on the login screen.  2. System prompts the user to enter their institutional email.  3. User submits the email.  4. System verifies the email against registered accounts.  5. System sends account recovery instructions to the verified email.  6. User opens the recovery email and follows the instructions.  7. User regains access and is returned to the login screen.  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Email Not Registered (from Step 4): If the submitted email does not match any registered account, the system displays an error message and prompts the user to check the email entered.  A2. Recovery Email Delivery Failure (from Step 5): If the system fails to send the recovery email, the system displays a delivery failure message and prompts the user to retry later.  |
| Postconditions | 1. User receives recovery instructions via email.  2. User is able to return to the login screen and log in successfully.  |

| Use Case Name | Manage User Roles & Permissions  |
|---| ---| 
| Actors | Admin User |
| Goal | Manage system user roles and access permissions. |
| Preconditions | 1. Admin user is authenticated. 2. Admin has permission to manage user accounts.  |
| Main Flow | 1. Admin opens the user management interface. 2. System displays the list of registered users. 3. Admin selects a user account. 4. Admin assigns or updates user roles and permissions. 5. System validates the changes. 6. System saves updated user role information. |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Invalid Permissions Selected (from Step 5): If the system detects an invalid or conflicting permission assignment, the system displays an error message and prompts the admin to correct the selection before saving.  A2. Save Failure (from Step 6): If the system fails to save the changes, the system displays an error message and prompts the admin to retry.  |
| Postconditions | 1. User roles and permissions are updated successfully. 2. Updated access controls are applied to the user account.  |

| Use Case Name | Validate Security Token  |
|---| ---| 
| Actors | Authentication Server  |
| Goal | To validate the security token returned by Microsoft Authentication and establish a secure user session within the EvacSense system.  |
| Preconditions | 1. User has successfully authenticated via Microsoft Authentication.   2. Microsoft Authentication Service has returned a valid token.   3. Internet connection is available.  |
| Main Flow | 1. Microsoft Authentication Service returns a security token.  2. System receives and reads the token.  3. System verifies token validity and expiration.  4. System extracts user identity from the token.  5. System matches user identity against registered EvacSense accounts.  6. System establishes a secure session and grants role-appropriate access.  |
| Alternate Flows / Exceptions Invalid Credentials:  | A1. Invalid or Expired Token (from Step 3): If the token fails validation or has expired, the system rejects authentication and returns the user to the login screen.  A2. User Account Not Found (from Step 5): If the extracted identity does not match any registered account, the system denies access and displays an error message.   |
| Postconditions | 1. A valid session is established for the authenticated user.  2. User is redirected to their role-appropriate interface.  |

##### 

##### Activity Diagram :

##### Wireframe : 

### Module 2 : Classroom Presence Recording

This module is responsible for detecting and logging the presence of students, teachers, and staff in each classroom or room before and during the evacuation drill.

#### 2.1 Trigger Automatic Classroom Detection 

##### Use Case Diagram :

##### Use Case Description :

| Use Case Name | Trigger Automatic Classroom Detection  |
|---| ---| 
| Primary Actor | Safety Officer (Drill Coordinator)  |
| Supporting Actor | Campus Wi-Fi Infrastructure  |
| Goal | To automatically detect, evaluate, and record the presence of all students in their assigned classrooms at the exact moment the drill begins, establishing a navigation origin and missing-person baseline.  |
| Preconditions | Institutional floor layouts and classroom seating assignments are registered in the database. Campus Wi-Fi access points are active and reachable. Students have their mobile devices with Wi-Fi enabled. |
| Main Flow | The Safety Officer activates the scheduled earthquake drill session from the web dashboard. The system immediately initiates automated classroom detection by pinging the Wi-Fi presence of registered student devices across all mapped rooms.  The system captures device identifiers and RSSI signal strength readings from nearby student mobile devices. The system evaluates the RSSI boundaries and cross-references the detected devices with the registered student database. For every verified match, the system logs the student's presence with a drill-start timestamp and sets their detected classroom as their navigation origin.  The system instantly populates the real-time classroom attendance list on the Safety Officer's dashboard. |
| Alternative Flow (Undetected or Unverified Signal):  | A1. Signal Unavailable/Weak: If a registered student's device is not detected during the initial scan (e.g., device off, no Wi-Fi, or signal falls below the valid RSSI threshold), the system automatically flags that student as Location-Unverified on the dashboard. This flags them for manual follow-up during the evacuation assembly phase.  |
| Postconditions | The pre-drill classroom presence baseline is finalized and stored in the database. Navigation origin points are set for all verified students. Unverified students are flagged on the dashboard. |

##### Activity Diagram :

##### 

##### 

##### 

### Module 3 : Shortest - Path Evacuation Navigation

#### 3.1 Display Evacuation Route

##### Use Case Diagram :

##### Use Case Description : 

Display Evacuation Route

| Use Case Name | Display Evacuation Route |
|---| ---| 
| Primary Actor | Student |
| Goal | To provide the student with the safest and shortest evacuation route from their current classroom location to the assigned assembly area. |
| Preconditions | A drill session is currently active. The student is logged into the mobile application with Wi-Fi enabled. The school map and evacuation routes have been configured by the Drill Coordinator. |
| Main Flow | The Student receives a drill notification and opens the evacuation screen in the mobile application. The system automatically detects the Student's current indoor location using Wi-Fi RSSI signals. The system retrieves the Student's assigned evacuation assembly area from the database. The system calculates the shortest evacuation path from the detected location to the assembly area using the pre-mapped building graph. The system displays the route and active turn-by-turn navigation instructions on the Student's device. The Student follows the displayed route to safely evacuate. |
| Alternative Flow | A1. Weak Wi-Fi Signal: If the indoor location cannot be detected automatically, the system prompts the Student to manually select their current room from a dropdown list before computing the path. A2. Network Connection Lost: If the network connection drops during the drill, the system gracefully notifies the Student of the offline status rather than crashing, pausing real-time updates until the connection is restored. A3. No Valid Route: If a configuration error results in no valid path being found, the system displays an alert directing the Student to the nearest default safe exit. |
| Postconditions | The Student successfully receives navigation guidance. The detected location and route details are logged as the navigation origin for the drill session. |

Configure Evacuation Routes

| Use Case Name | Configure Evacuation Routes  |
|---| ---| 
| Primary Actor | Drill Coordinator / Administrator  |
| Goal | To configure the evacuation routes, exits, corridors, staircases, and assembly areas that the system will use to compute shortest-path navigation.  |
| Preconditions | The Drill Coordinator is securely logged into the web dashboard. The baseline school floor plans, buildings, and rooms are already registered in the system. |
| Main Flow | The Drill Coordinator opens the evacuation route configuration page on the dashboard. The system displays the interactive school floor plan. The Drill Coordinator selects and connects rooms, corridors, exits, and staircases to map the valid pathways. The Drill Coordinator assigns specific evacuation zones and safe exits. The system validates the route connectivity to ensure all paths are accessible and logical. The Drill Coordinator saves the configured evacuation map. The system successfully stores the route configuration in the database and confirms the update. |
| Alternative Flow | A1. Conflicting Routes: If the system detects duplicate, dead-end, or conflicting evacuation routes during validation, it pauses the save process and prompts the Coordinator to review and resolve the specific conflicts.  |
| Postconditions | Evacuation routes are stored successfully. The mapped graph becomes immediately available for shortest-path computations when a drill is initiated. |

##### Activity Diagram :

##### Wireframe :

### Module 4 : Evacuation Area Attendance and Authentication

This module records and verifies the arrival of evacuees at the designated assembly area.

#### 4.1 Evacuee Arrival Confirmation

##### Use Case Diagram :

##### Use Case Description :

Detect Arrival via WIFI

| Use  Case Name | Detect Arrival via WIFI |
|---| ---| 
| Primary Actor | Student |
| Supporting Actor | Companion |
| Goal | To detect, verify, and accurately record the arrival of students at the evacuation assembly area using Wi-Fi, ID input, and facial recognition, while allowing peer-assisted check-ins.  |
| Preconditions |  The evacuation drill is active.  The Student's device has Wi-Fi enabled. |
| Main Flow | 1. The Student arrives at the assembly area, and their device connects to the designated evacuation Wi-Fi access point. 2. The system detects the arrival and prompts the Student to input their Student ID number. 3. The Student inputs their ID, and the system validates it against the database. 4. Upon successful ID validation, the system marks the Student as "Present" in the attendance log. |
| Postconditions | The student's attendance is securely authenticated and recorded.  |

Perform Face Recognition

| Use  Case Name | Perform Face Recognition  |
|---| ---| 
| Primary Actor | Student, Companion  |
| Goal | To securely verify the identity of the student by comparing a live photo capture against their registered database profile.  |
| Preconditions |   A valid Student ID has just been submitted to the system.  |
| Main Flow | 1. The system activates the mobile device camera. 2. The user (Student or Companion) captures a clear photo of the Student's face. 3. The system analyzes the photo and compares it against the registered profile photo in the database. 4. The system confirms a match (with >95% confidence). 5. The system returns a Verification Success status to the parent use case. |
| Alternative Flow  | A1. Poor Quality / Mismatch: If the photo is blurry or does not match, the system prompts the user to retry (up to 3 times). If it fails 3 times, the system flags the student for manual marshal verification.  |
| Postconditions | The student's identity is securely authenticated.  |

Accept Peer Photo 

| Use  Case Name | Accept Peer Photo  |
|---| ---| 
| Primary Actor | Companion  |
| Goal | To allow a student with a mobile device to check in a classmate who does not have a smartphone.  |
| Preconditions | The Companion is logged into the EvacSense application at the assembly area.  |
| Main Flow | 1. The Companion selects the Peer-Assist feature on their dashboard. 2. The Companion inputs the Student ID of their classmate. 3. The system validates the ID against the database. 4. The system triggers the Perform Face Recognition use case (<<include>>). 5. Upon receiving verification success, the system logs the classmate's attendance as "Present (Peer-Assisted)." |
| Postconditions | The student's arrival sequence is initiated and handed over to the biometric system.  |

Activate Distress Alert 

| Use  Case Name | Activate Distress Alert  |
|---| ---| 
| Primary Actor | Student, Companion  |
| Goal | To immediately notify the Safety Officer that a student requires emergency assistance.  |
| Preconditions | The user has the EvacSense application open.  |
| Main Flow | 1. The user presses the "Distress Alert" button on their mobile interface. 2. The system immediately captures the user's ID, current time, and last known location. 3. The system logs the distress signal in the database. 4. The system pushes an urgent pop up notification to the Safety Officer's dashboard. |
| Postconditions | The emergency alert is successfully transmitted to the administration dashboard.  |

##### Activity Diagram :

##### Wireframe :

#### 4.2 Evacuation Monitoring and Alerts 

 Use Case Diagram :

##### Use Case Description :

| Use  Case Name | Monitor Dashboard and Alerts |
|---| ---| 
| Primary Actor | Safety Officer  |
| Goal | To monitor real-time evacuation attendance, oversee distress alerts, and identify unaccounted students through automated missing-person flags.  |
| Preconditions |  The evacuation drill is active.  The Safety Officer is logged into the EvacSense dashboard. |
| Main Flow | 1. The Safety Officer views the live monitoring dashboard as students arrive at the assembly area. 2. The system continuously updates the dashboard with verified attendance records processed from the mobile application. 3. The system tracks the elapsed time against the target evacuation time limit. 4. If the target evacuation time expires, the system automatically cross-references the attendance list with the pre-drill classroom presence list (established in Module 2). 5. The system automatically generates a "Missing-Person Alert" on the dashboard for any student who was present in their classroom but has not checked in at the evacuation area. |
| Alternative Flow (Distress)  | A1. Distress Signal Received: If a student triggers a Distress Alert, the system immediately pushes an urgent visual and audio notification to the dashboard. The Safety Officer reviews the alert details (name, location) to initiate a targeted rescue response.  |
| Postconditions |  The Safety Officer has an accurate, real-time view of present, missing, and distressed students.  |

Activity Diagram:

WireFrame:

### Module 5 : Post - Drill Monitoring and Real - Time Reporting

This module provides drill coordinators with live monitoring tools and post-drill analytical reports.

5.1 Live Drill Dashboard

##### Use Case Diagram :

##### Use Case Description :

| Use Case Name | View Live Dashboard  |
|---| ---| 
| Primary Actor | Drill Coordinator |
| Goal | Monitor live evacuation progress and student accountability during drills.  |
| Preconditions | User is logged into the system. An active drill session exists.  |
| Main Flow | The Drill Coordinator opens the Live Drill Dashboard. The system displays the campus floor plan. The system shows classroom evacuation statuses. The system displays updated student headcounts. The system highlights missing or unverified students. The system continuously refreshes drill data in real time.  |
| Alternative Flow | If no active drill session exists, the system displays a “No Active Drill Session” message. If live evacuation data becomes unavailable, the system displays a synchronization warning and temporarily shows the latest available data. If the user is unauthorized, the system denies access and redirects the user to the login page.  |
| Postconditions | Live drill information remains updated. Missing students are identified for further action.  |

##### Activity Diagram :

##### Wireframe :

5.2 Post - Drill Generation

##### Use Case Diagram :

##### Use Case Description :

| Use Case Name | Export Analytics Summary |
|---| ---| 
| Primary Actor | Drill Coordinator |
| Goal | To generate and compile detailed historic safety summaries, chronological timeline trends, compliance indicators, and user breakdowns into external document templates (PDF/CSV) once a simulated drill concludes. |
| Preconditions | The drill tracking session must be officially marked as "Concluded" or "Ended". All drill logs and data must be compiled inside the system database. |
| Main Flow | The Drill Coordinator selects a finished drill from the tracking history list. The Coordinator clicks the "Export Report" button on the interface. The coordinator selects the output format (PDF or CSV) The system generates the report in the selected format The coordinator downloads the file to their device  |
| Alternative Flows | If no completed drill session exists, the system displays a “No Completed Drill Available” message. The Drill Coordinator cannot proceed with report export.  |
| Postconditions  | The analytics report is successfully exported and saved to the coordinator’s device The report can be shared with administrators or included in drill documentation |

##### Activity Diagram :

##### Wireframe :

## Non-functional requirements

### Performance

##### •        The system must support up to 2,000 concurrent users during a drill without degradation in response time.

##### •        Route computation must be completed and delivered to the mobile device within 3 seconds of drill initiation.

##### •        Live dashboard updates must reflect changes within 5 seconds of an event occurring.

##### •        Attendance confirmation (Face recognition or Wi-Fi detection) must be processed and logged within 2 seconds. 

##### •        The backend API must maintain an average response time of under 500ms for all endpoints under normal load.

##### 

### Security

##### •        All data transmissions must be encrypted using TLS 1.2 or higher (HTTPS/WSS).

##### •        User passwords must be stored using bcrypt hashing with a minimum cost factor of 12.

##### •        The system must implement role-based access control (RBAC) ensuring users can only access data and functions appropriate to their role.

##### •        Student and personnel personal data must be handled in compliance with the Philippine Data Privacy Act (RA 10173).

##### •        Session tokens must expire after 1 hour of inactivity; all sessions must be invalidated upon logout.

##### •        The system must log all authentication events (login, logout, failed attempts) with timestamps for audit purposes.

##### 

### Reliability

•        The system must achieve a minimum uptime of 99.5% during scheduled drill periods.

•        All drill session data must be persisted to the database before any confirmation response is sent to the client to prevent data loss.

•        The system must implement automatic retry logic for sensor data collection in the event of intermittent Wi-Fi connectivity.

•        Critical failures (e.g., database unavailability, navigation service crash) must trigger automated alerts to the system administrator within 60 seconds.

•     Local State Synchronization — If a student's network connection drops at the exact moment they arrive at the evacuation zone, the mobile app must temporarily queue their arrival timestamp locally and automatically sync the attendance record with the backend once the connection is restored. 