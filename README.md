# Bicol University College Student Council (BU CSC) Invoice and Merchandise Management System

A comprehensive web application for managing CSC fee payments, merchandise sales, and student transactions at Bicol University (BU Polangui).

---

## 🎓 Overview

The BU CSC Invoice and Merchandise Management System streamlines the financial operations of the College Student Council by providing a centralized platform for:

- **CSC Fee Management**: Students can pay their CSC fees and staff can approve payments
- **Merchandise Store**: Browse, purchase, and track CSC merchandise
- **Order Processing**: Full order lifecycle from pre-order to completion
- **Administrative Control**: User management, reports, and system configuration

---

## ✨ Core Features

### 1. Role-Based Dashboards

The system supports three user roles with tailored interfaces:

#### Student Dashboard
- **CSC Fee Status Overview**: Real-time status of fee payments (Paid/Unpaid/Pending)
- **Order Statistics**: Total orders placed and pending orders count
- **Quick Actions**: Direct access to Merchandise Store, Fee Payment, and Order History
- **Digital Receipts**: View and download receipts for approved fee payments

#### Staff Dashboard
- **Payment Approvals**: Pending fee payments requiring review
- **Order Management**: Pending pre-orders and status updates
- **Revenue Tracking**: Total revenue from both fees and merchandise sales
- **Quick Links**: Direct navigation to all staff modules

#### Admin Dashboard
- **System Statistics**: Total users, payments, orders, and merchandise items
- **Revenue Overview**: Combined revenue from fees and merchandise
- **Quick Access**: User management, reports, and system settings

---

### 2. Student Module

#### Fee Payment
- **QR Code Display**: Configurable QR code for fee payments
- **Proof Upload**: Students can upload payment proof (screenshot/receipt)
- **Status Tracking**: Fee status changes from Unpaid → Pending Approval → Paid
- **Digital Receipts**: Downloadable receipts for approved payments

#### Merchandise Store
- **Product Browsing**: View all available CSC merchandise with images, descriptions, and prices
- **Size Selection**: Select sizes for apparel items (T-shirts, jackets)
- **Stock Display**: Real-time stock quantity for each product
- **Add to Cart**: One-click addition to shopping cart

#### Shopping Cart & Orders
- **Cart Management**: View, update quantities, and remove items
- **Order Placement**: Create pre-orders with unique order numbers
- **Order Tracking**: Track orders through statuses: Pending → Confirmed → Ready → Completed
- **Claim Information**: View claim date and venue for completed orders
- **Receipt Generation**: Download order receipts as PDF

---

### 3. Staff Module

#### Fee Approvals
- **Pending Payments List**: View all pending fee payment submissions
- **Proof Verification**: Review uploaded payment proof
- **Approve/Reject Actions**: Update payment status with one click
- **Receipt Generation**: Automatic receipt creation upon approval

#### Order Management
- **Order Overview**: View all pre-orders with filtering by status
- **Status Updates**: Update order status through the workflow
- **Claim Configuration**: Set claim dates and venues for orders
- **CSV Export**: Export filtered orders to CSV format

#### Inventory Management
- **Product CRUD**: Add, edit, delete, and disable merchandise
- **Stock Management**: Update stock quantities and availability
- **Image Upload**: Product image management
- **Size Configuration**: Configure available sizes for apparel items

#### Settings
- **QR Code Configuration**: Update the payment QR code URL
- **Academic Year**: Set current academic year
- **CSC Fee Amount**: Configure the CSC membership fee amount

---

### 4. Administrator Module

Includes all staff capabilities plus:

#### User Management
- **User Directory**: List all system users with details
- **Role Assignment**: Assign roles (Student/Staff/Admin)
- **User CRUD**: Add, edit, and delete user accounts
- **Profile Management**: Update user profiles and student information

#### Reports
- **Financial Reports**: Generate revenue reports by academic year
- **Fee Revenue**: Track all approved CSC fee payments
- **Merchandise Sales**: Track completed merchandise orders
- **CSV Export**: Export report data to CSV for external analysis

#### System Settings
- **Academic Year**: Configure current academic year
- **Fee Configuration**: Set CSC membership fee amount
- **Payment Settings**: QR code URL for student payments

---

### 5. General Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Real-time Updates**: UI updates instantly as data changes
- **Form Validation**: Client-side validation for all inputs
- **Flash Notifications**: Success/error messages after every action
- **Bicol University Branding**: Official BU colors (dark blue #0B2A5B and gold accents)
- **Card-based UI**: Clean, modern interface with consistent design language

---

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database + Authentication)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF for receipt downloads
- **Build Tool**: Vite

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student@bicol-u.edu.ph` | `Demo@2026!` |
| CSC Staff | `cscstaff@bicol-u.edu.ph` | `Demo@2026!` |
| Admin | `administrator@bicol-u.edu.ph` | `Demo@2026!` |

---

## 📊 Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with student information |
| `user_roles` | Role assignments (student/staff/admin) |
| `merchandise` | Product catalog with inventory |
| `cart_items` | Student shopping carts |
| `orders` | Order records with status tracking |
| `order_items` | Individual items within orders |
| `csc_fee_payments` | Fee payment records and approvals |
| `system_settings` | System configuration (fee amount, academic year, QR URL) |

---

## 🎨 Design System

### Colors
- **Primary**: Dark Blue (#0B2A5B) - Bicol University official color
- **Secondary**: Gold/Yellow (#FFD700) - Accent color
- **Success**: Green (#28a745) - Paid/Approved/Completed
- **Warning**: Yellow (#ffc107) - Pending
- **Danger**: Red (#dc3545) - Rejected/Cancelled

### UI Components
- Card-based layouts with subtle shadows
- Smooth hover effects and transitions
- Responsive navigation (sidebar on desktop, mobile-friendly)
- Modal forms for data entry
- Status badges with color coding

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px - Stacked cards, simplified navigation
- **Tablet**: 768px - 1024px - 2-column grids
- **Desktop**: > 1024px - Full sidebar, multi-column layouts

---

## 🔐 Security Features

- **Row Level Security (RLS)**: Database policies restrict data access
- **Role-based Access**: Users can only access features appropriate to their role
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Data Validation**: Client and server-side validation for all inputs

---

## 📦 Pre-loaded Sample Data

The system comes with sample data for demonstration:

### Sample Merchandise
- Lanyard – ₱50
- T-shirt – ₱250
- Seal & Plate – ₱150
- ID Lace – ₱30
- Jacket – ₱500

### Sample Orders & Payments
- Multiple orders with various statuses
- Fee payments in different approval states

---

## 🎯 Usage Flows

### Student Flow
1. Log in as student
2. View CSC fee status on dashboard
3. Browse merchandise store
4. Add items to cart
5. Place pre-order
6. Pay CSC fee via QR code
7. Upload payment proof
8. Track orders and download receipts

### Staff Flow
1. Log in as staff
2. Review pending fee payments
3. Approve/reject payments
4. Manage pre-orders and set claim details
5. Update inventory
6. Configure system settings

### Admin Flow
1. Log in as admin
2. Manage all users and roles
3. Generate financial reports
4. Configure system-wide settings
5. Access all staff functionality

---

## 📝 License

This project is built for the Bicol University College Student Council.

---

## 🤝 Support

For support or questions about the system, please contact the CSC technical team or visit the project dashboard.

---

**Built with ❤️ for Bicol University CSC**
