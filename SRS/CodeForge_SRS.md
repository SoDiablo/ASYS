# Smart Building Management System (SBMS) — ASYS
## Software Requirements Specification (SRS)

**Project Group:** CodeForge  
**University:** Kocaeli University of Health and Technology  
**Course:** Software Engineering Lab II — 2025-2026 Spring Semester  
**Submission Date:** March 27, 2026 | **Presentation Date:** April 3, 2026

---

## Team Members

| Full Name | Student No | Role |
|---|---|---|
| Kusai Aksoy | 230501002 | Team Leader |
| Hashem Salem | 230502064 | Data Model |
| Namik Hasan | 230501055 | UML Diagrams |
| Rama Hasanatu | 230502053 | UI Design |
| Melih Kamil USLU | 230501059 | Documentation + UI Design |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [General System Description](#2-general-system-description)
3. [User Roles and Authorization](#3-user-roles-and-authorization)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Business Rules and Constraints](#6-business-rules-and-constraints)
7. [Data Model (Database)](#7-data-model-database)
8. [UML Diagrams](#8-uml-diagrams)
9. [Interface Wireframes](#9-interface-wireframes)
10. [Project Planning](#10-project-planning)

---

## 1. Introduction

### 1.1 Purpose of the Document
This document is the Software Requirements Specification (SRS) prepared for the Smart Building Management System (SBMS). It covers the system scope, user roles, functional and non-functional requirements, business rules, data model, UML diagrams, and interface wireframes.

### 1.2 Project Scope
SBMS is a web-based information system designed to digitize management processes in multi-story residential apartment complexes. The system integrates critical processes such as dues tracking, maintenance/repair requests, common area reservations, parking management, and announcement management into a single platform.

### 1.3 Target Audience
- **Building Manager (Admin):** The top-level user who manages the system overall
- **Apartment Resident:** Registered residents of the complex (owner or tenant)
- **Security Guard:** Personnel responsible for entry/exit control and parking management

### 1.4 Technology Stack

| Layer | Preferred Technology |
|---|---|
| Frontend | React.js (Web Application) |
| Backend | Node.js / Express.js |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Token) + Bcrypt |
| Server | Docker / AWS EC2 |

### 1.5 Abbreviations

| Abbreviation | Description |
|---|---|
| SBMS | Smart Building Management System |
| SRS | Software Requirements Specification |
| JWT | JSON Web Token |
| ER | Entity-Relationship |
| UML | Unified Modeling Language |
| CRUD | Create, Read, Update, Delete |
| RBAC | Role-Based Access Control |

---

## 2. General System Description

### 2.1 System Overview
The Smart Building Management System (SBMS) is a multi-user, web-based platform designed to streamline apartment and residential complex management. The system allows residents to manage their dues payments, maintenance requests, common area reservations, and parking operations through a single interface.

### 2.2 System Context
The system has 3 core user roles: Manager (Admin), Apartment Resident, and Security Guard. Each user accesses the system within the scope of their authority. The Admin has full access to all modules; the Resident can only view their own operations; and the Security Guard can only access parking and visitor information.

### 2.3 System Modules

| Module No | Module Name | Description |
|---|---|---|
| M-01 | Authentication | User login, role assignment, token management |
| M-02 | Dues Management | Monthly dues tracking, payment records, late payment notifications |
| M-03 | Maintenance & Repair | Request creation, assignment, status tracking |
| M-04 | Announcement Management | Manager announcements, notifications |
| M-05 | Common Area Reservation | Gym, meeting room, children's playground reservations |
| M-06 | Parking Management | Parking spot assignment, visitor vehicle registration |
| M-07 | Reporting & Dashboard | Payment summary, request statistics, graphical indicators |
| M-08 | User Management | Resident registration, role assignment, profile update |

---

## 3. User Roles and Authorization

The system operates with Role-Based Access Control (RBAC). Access permissions for each role are defined below.

### 3.1 Manager (Admin)
The highest-level user with full access to the system.
- Full access to all modules (read, write, update, delete)
- Create and delete new resident accounts
- Set and update dues amounts
- Assign personnel to maintenance requests
- Publish announcements
- View and export reports
- Assign parking spots

### 3.2 Apartment Resident
People living in the apartment complex (property owner or tenant).
- View dues history for their own apartment
- Make online dues payments
- Create and track maintenance/repair requests
- Make and cancel common area reservations
- View announcements
- Update their own profile

### 3.3 Security Guard
Personnel working at the entrance/exit point of the complex. Limited permissions.
- Create visitor vehicle records
- View parking spot occupancy status
- Keep guest/visitor entry-exit logs
- View resident list (limited to name and apartment number only)

### 3.4 Permission Matrix

| Module | Manager | Resident | Security |
|---|---|---|---|
| Authentication | Full Access | Own Account | Own Account |
| Dues Management | Full Access | Own Dues | No Access |
| Maintenance & Repair | Full Access | Own Requests | No Access |
| Announcement Management | Create/Delete | View Only | View Only |
| Common Area Reservation | Full Access | Own Reservations | No Access |
| Parking Management | Full Access | Own Vehicle | Full Access |
| Reporting | Full Access | No Access | No Access |
| User Management | Full Access | Own Profile | No Access |

---

## 4. Functional Requirements

Each requirement is defined with a unique ID. Requirements are expressed in a testable and measurable manner.

### 4.1 Authentication and Authorization

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall allow users to log in with their email and password. | High |
| FR-02 | Upon successful login, the system shall generate a JWT token and deliver it to the user. | High |
| FR-03 | JWT token validity shall be 24 hours; access with an expired token shall be denied. | High |
| FR-04 | Each user shall be assigned only one role; access to pages outside their role shall be blocked. | High |
| FR-05 | Passwords shall be stored in the database as bcrypt hashes. | High |
| FR-06 | Users shall be able to reset their password via email using the 'Forgot Password' feature. | Medium |
| FR-07 | The manager shall be able to mark user accounts as active or inactive. | Medium |

### 4.2 Dues Management

| ID | Requirement | Priority |
|---|---|---|
| FR-08 | The system shall automatically generate monthly dues records for each apartment. | High |
| FR-09 | Residents shall be able to pay dues online via bank transfer or credit card. | High |
| FR-10 | Upon payment, the payment date, amount, and method shall be recorded in the system. | High |
| FR-11 | Residents shall receive email and in-system notifications for overdue dues. | High |
| FR-12 | A 2% monthly late fee shall be automatically calculated for overdue payments. | Medium |
| FR-13 | The manager shall be able to view the payment status of all apartments in a list. | High |
| FR-14 | Residents shall be able to filter and view their own historical payment records. | Medium |

### 4.3 Maintenance and Repair Request Management

| ID | Requirement | Priority |
|---|---|---|
| FR-15 | Residents shall be able to create requests by selecting a category (electrical, water, elevator, etc.), adding a description and photo. | High |
| FR-16 | Created requests shall be sent to the manager as an instant notification. | High |
| FR-17 | The manager shall be able to update request status to 'Pending', 'In Progress', or 'Completed'. | High |
| FR-18 | Residents shall receive a notification when their request status changes. | Medium |
| FR-19 | Residents shall be able to rate completed requests with 1-5 stars. | Low |
| FR-20 | The manager shall be able to filter request history by date range and category. | Medium |

### 4.4 Announcement Management

| ID | Requirement | Priority |
|---|---|---|
| FR-21 | The manager shall be able to publish announcements by filling in title and content fields. | High |
| FR-22 | Published announcements shall be delivered as notifications to all logged-in residents. | High |
| FR-23 | Residents shall be able to view all past announcements sorted by date. | Medium |
| FR-24 | The manager shall be able to edit or delete published announcements. | Medium |

### 4.5 Common Area Reservation Management

| ID | Requirement | Priority |
|---|---|---|
| FR-25 | The system shall accept reservations for the gym, meeting room, and children's playground. | High |
| FR-26 | Residents shall be able to make reservations by selecting an available time slot from a calendar view. | High |
| FR-27 | Overlapping reservations for the same area at the same time shall not be allowed. | High |
| FR-28 | Residents shall be able to cancel reservations; cancellation must be made at least 2 hours before the event. | Medium |
| FR-29 | The manager shall be able to view all reservations and cancel any reservation. | High |
| FR-30 | Each resident shall be able to make a maximum of 1 reservation per common area per day. | Medium |

### 4.6 Parking Management

| ID | Requirement | Priority |
|---|---|---|
| FR-31 | The manager shall be able to assign one or more parking spot numbers to each apartment. | High |
| FR-32 | Security guards shall be able to enter visitor vehicle license plates and the visited apartment into the system. | High |
| FR-33 | A maximum parking duration of 4 hours shall be definable for visitor vehicles. | Medium |
| FR-34 | Security guards shall receive automatic alerts for visitor vehicles that exceed their allowed duration. | Medium |
| FR-35 | The manager shall be able to view the parking spot occupancy map in real time. | High |

### 4.7 Reporting and Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-36 | The manager dashboard shall display total dues collected, number of open requests, and occupancy rate. | High |
| FR-37 | The system shall be able to export monthly dues collection reports in PDF format. | Medium |
| FR-38 | Maintenance requests shall be displayed by category in a pie chart. | Medium |
| FR-39 | The dues payment trend for the last 12 months shall be presented in a line chart. | Medium |
| FR-40 | The manager shall be able to filter and view the list of apartments with overdue dues. | High |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|---|---|
| NFR-01 | The system shall be optimized so that page load time does not exceed 3 seconds. |
| NFR-02 | The system shall support at least 100 concurrent user sessions. |
| NFR-03 | Database queries shall respond within 500 ms. |

### 5.2 Security

| ID | Requirement |
|---|---|
| NFR-04 | All HTTP communication shall be encrypted via HTTPS. |
| NFR-05 | If login fails 5 consecutive times, the account shall be locked for 15 minutes. |
| NFR-06 | Input validation mechanisms shall be applied against XSS and SQL injection attacks. |
| NFR-07 | User passwords shall be stored with BCrypt with a minimum length of 12 characters. |

### 5.3 Usability

| ID | Requirement |
|---|---|
| NFR-08 | The system shall guarantee 99.5% uptime (excluding planned maintenance). |
| NFR-09 | The interface shall have a responsive design for both mobile and desktop devices. |
| NFR-10 | New users shall be able to use the system within 30 minutes without additional training. |

### 5.4 Scalability and Maintainability

| ID | Requirement |
|---|---|
| NFR-11 | The system shall operate for complexes with up to 500 apartments without additional infrastructure. |
| NFR-12 | The application shall be deployable via Docker containers. |
| NFR-13 | Database backups shall be performed automatically daily, with 30 days of history retained. |

---

## 6. Business Rules and Constraints

### 6.1 Dues Rules
- **BR-01:** The monthly dues payment deadline is the 5th of each month.
- **BR-02:** Payments exceeding 5 days are subject to a 2% monthly late fee.
- **BR-03:** If a resident fails to pay for 3 consecutive months, an automatic warning notification is sent to the manager.
- **BR-04:** The dues amount can only be changed by the manager; changes take effect from the following month.

### 6.2 Maintenance and Repair Rules
- **BR-05:** A resident can have a maximum of 3 open maintenance requests at the same time.
- **BR-06:** Urgent category requests (gas leak, water flooding) must be responded to within 2 hours.
- **BR-07:** Unanswered requests exceeding 7 days trigger an escalation notification to the manager.

### 6.3 Reservation Rules
- **BR-08:** Each gym reservation can last a maximum of 2 hours.
- **BR-09:** The meeting room can be reserved by a single resident for a maximum of 4 hours per day.
- **BR-10:** Residents with outstanding dues cannot make common area reservations.
- **BR-11:** Common areas cannot be reserved between 23:00 and 07:00.

### 6.4 Parking Rules
- **BR-12:** A maximum of 2 parking spots can be assigned per apartment.
- **BR-13:** Visitor vehicles can remain on the premises for a maximum of 4 hours.
- **BR-14:** Parking spots reserved for disabled individuals cannot be assigned to other apartments.

### 6.5 General System Constraints
- **BR-15:** The system may be put into maintenance mode daily between 02:00 and 03:00; access is restricted during this period.
- **BR-16:** Deleted user data is retained for 6 months, then permanently deleted (GDPR/KVKK compliance).
- **BR-17:** All transaction logs (login, payment, request) must be retained for a minimum of 1 year.

---

## 7. Data Model (Database)

The system consists of **10 database tables**.

### 7.1 Table List

| No | Table Name | Description |
|---|---|---|
| T-01 | users | Identity and contact information of all users |
| T-02 | apartments | Information about apartments within the complex |
| T-03 | dues | Monthly dues records |
| T-04 | payments | Completed payment transactions |
| T-05 | maintenance_requests | Maintenance/repair requests |
| T-06 | announcements | Manager announcements |
| T-07 | common_areas | Reservable common areas |
| T-08 | reservations | Common area reservation records |
| T-09 | parking_spots | Parking spots and assignment information |
| T-10 | visitor_vehicles | Visitor vehicle records |

### 7.2 Table Details

#### T-01: users
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| user_id | UUID | PK, NOT NULL | Primary key |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Email address (used for login) |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| role | ENUM | NOT NULL | admin / resident / security |
| phone | VARCHAR(20) | NULL | Phone number |
| is_active | BOOLEAN | DEFAULT TRUE | Account active/inactive status |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |

#### T-02: apartments
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| apartment_id | UUID | PK, NOT NULL | Primary key |
| block | VARCHAR(10) | NOT NULL | Block name (A, B, C...) |
| floor | INTEGER | NOT NULL | Floor number |
| number | VARCHAR(10) | NOT NULL | Apartment number |
| user_id | UUID | FK -> users | Assigned resident |
| monthly_due | DECIMAL(10,2) | NOT NULL | Monthly dues amount |
| is_occupied | BOOLEAN | DEFAULT FALSE | Occupancy status |

#### T-03: dues
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| due_id | UUID | PK, NOT NULL | Primary key |
| apartment_id | UUID | FK -> apartments | Related apartment |
| due_date | DATE | NOT NULL | Payment deadline |
| amount | DECIMAL(10,2) | NOT NULL | Dues amount |
| penalty | DECIMAL(10,2) | DEFAULT 0 | Late fee |
| status | ENUM | NOT NULL | pending / paid / overdue |
| period_month | DATE | NOT NULL | Month the dues belong to |

#### T-04: payments
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| payment_id | UUID | PK, NOT NULL | Primary key |
| due_id | UUID | FK -> dues | Related dues record |
| user_id | UUID | FK -> users | User who made the payment |
| paid_amount | DECIMAL(10,2) | NOT NULL | Amount paid |
| payment_method | ENUM | NOT NULL | credit_card / bank_transfer |
| paid_at | TIMESTAMP | DEFAULT NOW() | Payment date and time |
| receipt_no | VARCHAR(50) | UNIQUE | Receipt number |

#### T-05: maintenance_requests
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| request_id | UUID | PK, NOT NULL | Primary key |
| apartment_id | UUID | FK -> apartments | Apartment that opened the request |
| user_id | UUID | FK -> users | Resident who created the request |
| category | ENUM | NOT NULL | electric / water / elevator / other |
| priority | ENUM | NOT NULL | low / medium / high / urgent |
| description | TEXT | NOT NULL | Fault description |
| photo_url | VARCHAR(255) | NULL | Photo path |
| status | ENUM | DEFAULT pending | pending / in_progress / done |
| created_at | TIMESTAMP | DEFAULT NOW() | Request opening date |
| resolved_at | TIMESTAMP | NULL | Resolution date |
| rating | INTEGER | NULL, CHECK 1-5 | Resident rating |

#### T-06: announcements
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| announcement_id | UUID | PK, NOT NULL | Primary key |
| admin_id | UUID | FK -> users | Manager who published the announcement |
| title | VARCHAR(200) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Announcement content |
| published_at | TIMESTAMP | DEFAULT NOW() | Publication date |
| is_active | BOOLEAN | DEFAULT TRUE | Active/deleted status |

#### T-07: common_areas
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| area_id | UUID | PK, NOT NULL | Primary key |
| name | VARCHAR(100) | NOT NULL | Area name (Gym, Meeting Room, etc.) |
| capacity | INTEGER | NOT NULL | Maximum person capacity |
| max_hours | INTEGER | NOT NULL | Maximum duration per reservation |
| open_time | TIME | NOT NULL | Opening time |
| close_time | TIME | NOT NULL | Closing time |
| is_active | BOOLEAN | DEFAULT TRUE | Usage status |

#### T-08: reservations
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| reservation_id | UUID | PK, NOT NULL | Primary key |
| area_id | UUID | FK -> common_areas | Reserved area |
| user_id | UUID | FK -> users | Resident who made the reservation |
| start_time | TIMESTAMP | NOT NULL | Start time |
| end_time | TIMESTAMP | NOT NULL | End time |
| status | ENUM | DEFAULT active | active / cancelled |
| cancelled_at | TIMESTAMP | NULL | Cancellation date |

#### T-09: parking_spots
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| spot_id | UUID | PK, NOT NULL | Primary key |
| spot_number | VARCHAR(10) | UNIQUE, NOT NULL | Parking spot number |
| apartment_id | UUID | FK -> apartments, NULL | Assigned apartment (NULL = empty) |
| type | ENUM | NOT NULL | standard / handicapped / visitor |
| is_occupied | BOOLEAN | DEFAULT FALSE | Real-time occupancy status |

#### T-10: visitor_vehicles
| Field Name | Data Type | Constraint | Description |
|---|---|---|---|
| visit_id | UUID | PK, NOT NULL | Primary key |
| plate_number | VARCHAR(20) | NOT NULL | Vehicle license plate |
| spot_id | UUID | FK -> parking_spots | Parking spot used |
| visited_apartment_id | UUID | FK -> apartments | Apartment being visited |
| entry_time | TIMESTAMP | DEFAULT NOW() | Entry time |
| exit_time | TIMESTAMP | NULL | Exit time |
| registered_by | UUID | FK -> users (security) | Security guard who registered |

### 7.3 Entity Relationships

| Table 1 | Relationship | Table 2 | Description |
|---|---|---|---|
| users | 1 - N | apartments | One user can be assigned to multiple apartments |
| apartments | 1 - N | dues | One apartment has multiple dues records |
| dues | 1 - N | payments | One dues record can have multiple payments |
| apartments | 1 - N | maintenance_requests | One apartment can open multiple requests |
| users | 1 - N | maintenance_requests | One resident can create multiple requests |
| users | 1 - N | announcements | One manager can publish multiple announcements |
| common_areas | 1 - N | reservations | One area can have multiple reservations |
| users | 1 - N | reservations | One resident can make multiple reservations |
| apartments | 1 - N | parking_spots | Multiple parking spots per apartment |
| parking_spots | 1 - N | visitor_vehicles | One spot can have multiple visitor records |

### 7.4 PostgreSQL Schema (DDL)

```sql
CREATE TYPE user_role AS ENUM ('admin', 'resident', 'security');
CREATE TYPE due_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer');
CREATE TYPE request_category AS ENUM ('electric', 'water', 'elevator', 'other');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE reservation_status AS ENUM ('active', 'cancelled');
CREATE TYPE spot_type AS ENUM ('standard', 'handicapped', 'visitor');

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE apartments (
  apartment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block VARCHAR(10) NOT NULL,
  floor INTEGER NOT NULL,
  number VARCHAR(10) NOT NULL,
  user_id UUID REFERENCES users(user_id),
  monthly_due DECIMAL(10,2) NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE
);

CREATE TABLE dues (
  due_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  penalty DECIMAL(10,2) DEFAULT 0,
  status due_status NOT NULL DEFAULT 'pending',
  period_month DATE NOT NULL
);

CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  due_id UUID NOT NULL REFERENCES dues(due_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  paid_amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  paid_at TIMESTAMP DEFAULT NOW(),
  receipt_no VARCHAR(50) UNIQUE
);

CREATE TABLE maintenance_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  category request_category NOT NULL,
  priority request_priority NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(255),
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(user_id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE common_areas (
  area_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  max_hours INTEGER NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE reservations (
  reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES common_areas(area_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status reservation_status NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMP
);

CREATE TABLE parking_spots (
  spot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_number VARCHAR(10) UNIQUE NOT NULL,
  apartment_id UUID REFERENCES apartments(apartment_id),
  type spot_type NOT NULL,
  is_occupied BOOLEAN DEFAULT FALSE
);

CREATE TABLE visitor_vehicles (
  visit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number VARCHAR(20) NOT NULL,
  spot_id UUID NOT NULL REFERENCES parking_spots(spot_id),
  visited_apartment_id UUID NOT NULL REFERENCES apartments(apartment_id),
  entry_time TIMESTAMP DEFAULT NOW(),
  exit_time TIMESTAMP,
  registered_by UUID NOT NULL REFERENCES users(user_id)
);
```

---

## 8. UML Diagrams

### 8.1 Use Case Diagram — Actors and Use Cases

| Actor | Use Case |
|---|---|
| Manager (Admin) | UC-01: Log Into System |
| Manager (Admin) | UC-03: Create/Delete Resident Account |
| Manager (Admin) | UC-04: Set Dues Amount |
| Manager (Admin) | UC-05: View Dues Payments |
| Manager (Admin) | UC-06: Update Maintenance Request |
| Manager (Admin) | UC-07: Publish Announcement |
| Manager (Admin) | UC-08: View Dashboard and Reports |
| Manager (Admin) | UC-09: Assign Parking Spot |
| Apartment Resident | UC-01: Log Into System |
| Apartment Resident | UC-02: Forgot Password |
| Apartment Resident | UC-10: Pay Dues |
| Apartment Resident | UC-11: View Dues History |
| Apartment Resident | UC-12: Create Maintenance Request |
| Apartment Resident | UC-13: Track Request Status |
| Apartment Resident | UC-14: Make Common Area Reservation |
| Apartment Resident | UC-15: Cancel Reservation |
| Apartment Resident | UC-16: View Announcements |
| Security Guard | UC-01: Log Into System |
| Security Guard | UC-17: Create Visitor Vehicle Record |
| Security Guard | UC-18: View Parking Spot Occupancy |
| Security Guard | UC-19: Record Vehicle Exit |
| Security Guard | UC-20: View Resident List |

### 8.2 Sequence Diagram — Dues Payment Flow

```
Resident -> Web UI      : Clicks Pay Dues button
Web UI   -> Backend API : POST /api/dues/{id}/pay [JWT Token]
Backend  -> Auth Service: Token validation request
Auth     -> Backend     : Token valid, user_id returned
Backend  -> Database    : Query dues record and debt amount
Database -> Backend     : Dues info and status returned
Backend  -> Payment Svc : Payment request (amount, card info)
Payment  -> Backend     : Payment approval + transaction number
Backend  -> Database    : INSERT into payments, dues.status = 'paid'
Backend  -> Notif Svc   : Send notification to resident and manager
Backend  -> Web UI      : Success response + receipt
Web UI   -> Resident    : Payment completed screen
```

### 8.3 Sequence Diagram — Maintenance Request Creation

```
Resident -> Web UI      : Fills out Report Fault form
Web UI   -> Backend API : POST /api/requests (category, description, photo)
Backend  -> Auth Service: Token validation
Auth     -> Backend     : Token valid

Backend  -> Database    : Query open request count (max 3 rule)
Database -> Backend     : Current open request count returned

[IF count >= 3]
  Backend -> Web UI     : ERROR: Maximum open request limit reached
  Web UI  -> Resident   : Error message displayed

[IF count < 3]
  Backend  -> Database    : INSERT into maintenance_requests
  Database -> Backend     : Request ID returned
  Backend  -> Notif Svc   : Instant notification sent to manager
  Backend  -> Web UI      : Request ID + success message
  Web UI   -> Resident    : Request created screen
```

### 8.4 Activity Diagram — Common Area Reservation Flow

```
START
  |
  v
Resident submits reservation request
  |
  v
System checks dues debt
  |
  +--[Has outstanding dues?]--> YES --> Show error: "Residents with dues cannot reserve" --> STOP
  |
  NO
  |
  v
Resident selects area and time slot
  |
  v
System checks time restriction
  |
  +--[Is it 23:00-07:00?]--> YES --> Show error: "Cannot reserve during these hours" --> STOP
  |
  NO
  |
  v
System checks daily limit
  |
  +--[Already has reservation today?]--> YES --> Show error: "Daily limit reached" --> STOP
  |
  NO
  |
  v
System checks for time conflicts
  |
  +--[Selected slot is taken?]--> YES --> Show alternative available times --> Resident selects new time
  |
  NO
  |
  v
Reservation approved and saved to database
  |
  v
Notification sent to resident and manager
  |
  v
Resident receives confirmation message
  |
  v
STOP
```

---

## 9. Interface Wireframes

### 9.1 Login Screen
| Component | Type | Description |
|---|---|---|
| Logo & System Name | Image/Text | Site logo at top center |
| Email Field | Input (email) | Required, format validation |
| Password Field | Input (password) | Show/hide toggle |
| Login Button | Button (primary) | Form submit, initiates API call |
| Forgot Password | Link | Redirects to password reset page |
| Error Message | Alert (error) | Displays invalid login message |

### 9.2 Manager Dashboard Screen
| Component | Type | Description |
|---|---|---|
| Sidebar | Navigation | Access links to all modules |
| Total Collection Card | KPI Card | Monthly dues collection amount |
| Open Requests Card | KPI Card | Number of pending maintenance requests |
| Occupancy Rate Card | KPI Card | Percentage of occupied apartments |
| Payment Trend Chart | Line Chart | Dues collection trend for last 12 months |
| Request Categories | Pie Chart | Distribution of requests by category |
| Overdue Apartments Table | Data Table | Apartments with late payments |
| Recent Announcements | List Widget | Summary of the 5 most recent announcements |

### 9.3 Resident – Dues Payment Screen
| Component | Type | Description |
|---|---|---|
| Current Debt Summary | Info Card | Dues amount, deadline, late fee |
| Payment Method | Radio Button | Credit Card / Bank Transfer |
| Card Details Form | Input Group | Card number, expiry, CVV |
| Pay Button | Button (primary) | Payment confirmation and API call |
| Payment History | Table | Date, amount, method, status |
| Download Receipt | Button (secondary) | PDF receipt download |

### 9.4 Security Guard – Vehicle Registration Screen
| Component | Type | Description |
|---|---|---|
| License Plate Input | Input (text) | Auto uppercase conversion |
| Visited Apartment | Dropdown/Search | Search by apartment number or name |
| Parking Spot Selection | Dropdown | List of available spots |
| Save Button | Button (primary) | Entry time automatically assigned |
| Vehicle List | Table | Currently parked visitor vehicles |
| Record Exit | Button (danger) | Records exit time for selected vehicle |

### 9.5 Additional Screens Designed
- **Maintenance Request Screen:** Category selection, description form, photo upload, active request log with status badges (PENDING / IN PROGRESS / DONE)
- **Amenity Reservation Screen:** Calendar date picker, time slot grid (BOOKED / AVAILABLE), facility type filter, active reservations list, conflict detection alert
- **Admin Settings Screen:** Profile management, 2FA toggle, password change, SMS/Push notification preferences
- **Announcement Management Screen:** Announcement feed with category filters, broadcast button, metrics (active alerts, read rate, planned events count)

> **Note:** The Chat (messaging) feature is outside the current system scope and is planned as a future enhancement.

---

## 10. Project Planning

### 10.1 Development Phases

| Phase | Scope | Duration | Deliverable |
|---|---|---|---|
| Phase 1 – Analysis | Requirements gathering, SRS preparation | 2 Weeks | SRS Document |
| Phase 2 – Design | Data model, UI/UX design, API design | 2 Weeks | Figma prototype, DB schema |
| Phase 3 – Development | Backend API, Frontend, Database | 6 Weeks | Working application |
| Phase 4 – Testing | Unit tests, integration tests, UAT | 2 Weeks | Test report |
| Phase 5 – Deployment | Docker deployment, user training | 1 Week | Live system |

### 10.2 Task Distribution

| Task Area | Responsible | Duration |
|---|---|---|
| Requirements Analysis & SRS | Kusai Aksoy | 2 Weeks |
| Data Model & Database Design | Hashem Salem | 3 Weeks |
| UML Diagrams | Namik Hasan | 2 Weeks |
| Interface Design (Figma) | Rama Hasanatu | 2 Weeks |
| Backend API Development | Kusai Aksoy & Hashem Salem | 6 Weeks |
| Frontend Development (React.js) | Rama Hasanatu & Melih Kamil USLU | 6 Weeks |
| Testing & Documentation | Melih Kamil USLU | 2 Weeks |

### 10.3 Risk Analysis

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Requirement changes | Medium | High | Weekly review meetings |
| Technical knowledge gaps | Medium | Medium | Documentation and pair programming |
| Time management issues | High | High | Detailed sprint planning |
| Database performance issues | Low | Medium | Indexing and query optimization |

---

*End of SRS Document — CodeForge — Smart Building Management System*
