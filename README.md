# Bill Generator - ML Powered Invoice Management System

## Project Description

**Bill Generator** is a comprehensive desktop application designed to simplify invoice and bill management. Built with Flask and packaged as a desktop app using PyWebView, it provides a professional, user-friendly interface for creating, managing, and tracking bills. The application features advanced capabilities like OCR (Optical Character Recognition) for extracting data from bill images, GST tax calculation, Excel export functionality, and an intuitive dashboard for complete financial oversight.

Perfect for small businesses, freelancers, and enterprises looking to streamline their billing workflow with a modern, responsive interface and secure local database management.

---

## Features

✨ **Core Billing Features:**
- 📝 Create and manage detailed invoices with multiple line items
- 🔍 Search and autocomplete for item selection
- 💾 Persistent SQLite database stored securely in user's home directory
- 📊 Real-time bill calculations with automatic tax (CGST/SGST) computation
- 📥 Export bills to Excel format with professional formatting
- 🔄 Update and delete bills with full audit trail via timestamps
- 📋 Batch import items for efficient bill creation

🔐 **Authentication & Security:**
- Admin login system with secure password hashing (Werkzeug)
- Session-based authentication with Flask-Login
- Protected API endpoints with @login_required decorators

📊 **Advanced Features:**
- 🤖 **OCR Integration:** Extract text from invoice images using EasyOCR for quick item entry
- 📈 **Payment Tracker:** Monitor payment status (Pending/Paid) for all bills
- 📅 **Task Management:** Built-in to-do list with due dates and completion tracking
- 🗄️ **Database Manager:** Full CRUD operations for the item master database
- 💡 **Item Master:** Maintain a database of reusable items with unit, HSN code, and tax percentages

🎨 **User Interface:**
- Responsive, modern UI built with Tailwind CSS and FontAwesome icons
- Multi-page navigation dashboard
- Mobile-friendly design
- Real-time form validation
- Intuitive notification system

📱 **Cross-Platform:**
- Desktop application (Windows/Mac/Linux support)
- PyWebView brings Flask app to native desktop window
- No browser required

---

## Tech Stack

### **Backend:**
- **Framework:** Flask 3.0+ (Python web framework)
- **Database:** SQLite (lightweight, serverless database)
- **ORM:** Flask-SQLAlchemy (database abstraction layer)
- **Authentication:** Flask-Login (session management)
- **Password Security:** Werkzeug (password hashing)
- **Excel Processing:** OpenPyXL (create/manipulate .xlsx files)
- **OCR:** EasyOCR (optical character recognition from images)
- **Utilities:** num2words (convert numbers to text for invoices)

### **Frontend:**
- **Framework:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **UI Framework:** FontAwesome Icons (vector icon library)
- **JavaScript Libraries:** AJAX for asynchronous API calls

### **Desktop Integration:**
- **PyWebView:** Convert Flask web app to native desktop application
- **PyInstaller:** Package and distribute as executable (.exe, .dmg, etc.)

### **Database Models:**
- `Item` - Master database of reusable items with unit, HSN, and tax rates
- `Bill` - Invoice headers with bill number, date, and total amount
- `BillItem` - Individual line items within bills with quantity, price, and taxes
- `Task` - To-do list items with descriptions and due dates

---

## Project Structure

```
bill_generator/
│
├─ app.py                          # Main Flask application with all routes and database models
├─ main.py                         # Entry point for PyWebView desktop app
├─ requirements.txt                # Python package dependencies
├─ README.md                       # This file
├─ BillGenerator.spec             # PyInstaller configuration for building executable
├─ bill_template.xlsx             # Excel template for bill export
├─ icon.ico                       # Desktop app icon
│
├─ templates/                      # HTML templates (Jinja2)
│  ├─ index.html                 # Dashboard homepage
│  ├─ login.html                 # Authentication page
│  ├─ bill_management.html       # Bills list and management page
│  ├─ new-bill.html              # Create/edit bill form
│  ├─ bill-details.html          # View bill details
│  ├─ database.html              # Item master database management
│  ├─ payment-tracker.html       # Payment status tracker
│  └─ todo.html                  # Task management page
│
├─ static/                         # Static assets
│  ├─ css/
│  │  ├─ style.css               # Custom application styles
│  │  ├─ all.min.css             # FontAwesome icon styles
│  │  └─ inter_fonts.css         # Inter font family
│  ├─ js/
│  │  ├─ script.js               # Main application logic
│  │  ├─ database.js             # Item master CRUD operations
│  │  ├─ download.js             # Excel download functionality
│  │  ├─ ocr.js                  # OCR image upload and processing
│  │  ├─ payment-tracker.js      # Payment status management
│  │  ├─ todo.js                 # Task management logic
│  │  └─ tailwind.min.js         # Tailwind CSS build
│  ├─ images/                    # Application logos and images
│  ├─ fonts/                     # Custom font files
│  └─ webfonts/                  # FontAwesome web fonts
│
├─ uploads/                        # Temporary folder for file uploads (created at runtime)
├─ instance/                       # Flask instance folder
├─ build/                          # PyInstaller build output
├─ dist/                           # Compiled executable and dependencies
└─ venv/                          # Python virtual environment
```

### **Key File Descriptions:**

| File | Purpose |
|------|---------|
| `app.py` | Heart of the application - contains Flask routes, database models, API endpoints for CRUD operations, OCR processing, and Excel export logic |
| `main.py` | PyWebView entry point that initializes the database and launches the desktop window |
| `requirements.txt` | Lists all Python package dependencies needed to run the application |
| `bill_template.xlsx` | Pre-formatted Excel template used as base for generating bill exports |
| `BillGenerator.spec` | Configuration file for PyInstaller - defines how to package the app into executable |

---

## Installation & Setup Instructions

### Prerequisites

- **Python 3.8+** (Download from [python.org](https://www.python.org/downloads/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **Windows 10+**, **macOS 10.14+**, or **Linux** (Ubuntu 18.04+)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/bill_generator.git
cd bill_generator
```

### Step 2: Create Virtual Environment

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt after activation.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask and extensions (SQLAlchemy, Login)
- Werkzeug (security utilities)
- OpenPyXL (Excel manipulation)
- num2words (number to text conversion)
- EasyOCR (image text recognition)
- PyWebView (desktop window integration)

---

## How to Run the Flask App

### Option 1: Run as Desktop Application (Recommended)

```bash
python main.py
```

This launches the application in PyWebView, presenting it as a native desktop window without exposing the browser.

### Option 2: Run as Web Application

```bash
python app.py
```

Then open your browser and navigate to:
```
http://localhost:5000
```

---

## Environment Variables

If you want to customize the application, you can modify these settings in `app.py`:

```python
# app.py (Line 39-40)
ADMIN_USERNAME = 'change_username'              # Change admin username
ADMIN_PASSWORD_HASH = '<hash_here>'     # Change admin password

# app.py (Line 24)
app.config['SECRET_KEY'] = 'change_secret_key'  # Change Flask secret key for sessions
```

### Generating a New Admin Password Hash

If you want to change the admin password, run this in Python:

```python
from werkzeug.security import generate_password_hash

# Replace 'your_new_password' with your desired password
new_password_hash = generate_password_hash('your_new_password')
print(new_password_hash)  # Copy this and paste in app.py
```

### Database Location

The SQLite database is automatically stored in:
- **Windows:** `C:\Users\YourUsername\.BillGeneratorApp\database.db`
- **macOS:** `/Users/YourUsername/.BillGeneratorApp/database.db`
- **Linux:** `/home/username/.BillGeneratorApp/database.db`

---

## Application Features Overview

### 1. **Dashboard (Home)**
- Welcome page with quick statistics
- Navigation to all modules
- User session display

### 2. **Bill Management**
- List all bills with search and filter options
- Create new bills with multiple line items
- Edit existing bills
- Delete bills
- View bill details and history
- Update payment status (Pending/Paid)

### 3. **Bill Creation Form**
- Add items from master database with autocomplete
- Specify quantity and price per item
- Automatic tax calculation (CGST/SGST)
- Real-time total calculation
- Handle multiple line items
- Generate unique bill numbers

### 4. **Item Master Database**
- View all items in the system
- Add new items with HSN code, unit, and tax rates
- Edit existing items
- Delete items
- Update item details (unit, HSN, CGST%, SGST%)

### 5. **Payment Tracker**
- Monitor all bills by payment status
- Update payment status
- Filter by paid/pending status
- View payment history

### 6. **OCR Bill Scanner**
- Upload invoice/bill images (PNG, JPG, JPEG)
- Automatically extract text using EasyOCR
- Parse extracted text to identify item names
- Auto-populate bill form with extracted items
- Clean up temporary files after processing

### 7. **Task Management (To-do List)**
- Create tasks with due dates
- Mark tasks as completed
- Edit task descriptions and due dates
- Delete tasks
- Filter active tasks

### 8. **Excel Export**
- Generate professional invoices in Excel format
- Auto-formatted with company branding
- Includes tax calculations and totals
- Grand total converted to words (Indian format)
- Download with bill number as filename

### 9. **Authentication**
- Secure admin login
- Password-protected access to all features
- Session management
- Logout functionality

---

## API Endpoints

The application provides RESTful API endpoints for programmatic access:

### Authentication Routes
- `POST /login` - User login
- `GET /logout` - User logout

### Page Routes
- `GET /` - Dashboard home
- `GET /bill_management` - Bill management page
- `GET /bill-details?id=<id>` - Single bill details
- `GET /new_bill` - Create new bill form
- `GET /database` - Item master database
- `GET /payment_tracker` - Payment tracker
- `GET /todo` - Task management

### Bill API Endpoints
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `GET /api/bills/<id>` - Get bill details
- `PUT /api/bills/<id>` - Update bill
- `DELETE /api/bills/<id>` - Delete bill
- `PUT /api/bills/<id>/status` - Update payment status

### Item Master API Endpoints
- `GET /api/items` - Get all items
- `POST /api/item` - Add new item
- `GET /api/item/<name>` - Get item details by name
- `PUT /api/items/<id>` - Update item
- `DELETE /api/items/<id>` - Delete item
- `GET /api/search?q=<query>` - Search items

### Task API Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### OCR API Endpoints
- `POST /api/ocr/upload` - Upload and process image with OCR

### Utility Endpoints
- `GET /api/bills/next_bill_number` - Get next available bill number
- `GET /api/bill/<id>/download` - Download bill as Excel

---

## Additional Configuration

### Excel Export Configuration

To customize the Excel export template:
1. Edit `bill_template.xlsx` with Microsoft Excel or LibreOffice Calc
2. Ensure the template structure matches the expected format:
   - Row 6, Column M: Bill number placeholder
   - Row 9, Column M: Date placeholder
   - Row 12 onwards: Item detail rows
3. Restart the application to apply changes

### Image Upload Settings

Modify in `app.py` (Line 34-35):
```python
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}  # Allowed image formats
UPLOAD_FOLDER = 'uploads'                     # Temporary upload directory
```

---

## Troubleshooting

### Common Issues

**Issue: "Database locked" error**
- Solution: Close all instances of the application and restart

**Issue: Images not uploading for OCR**
- Verify image format is PNG, JPG, or JPEG
- Check file size isn't too large (>10MB)
- Ensure `uploads` folder has write permissions

**Issue: Excel export fails**
- Confirm `bill_template.xlsx` exists in root directory
- Verify Excel file isn't corrupted
- Try re-downloading the template

**Issue: Application won't start**
- Verify Python environment is activated: `(venv)` should show in terminal
- Reinstall dependencies: `pip install -r requirements.txt`
- Clear cache: Delete `__pycache__` folder

---

## Example Screenshots

> **Placeholder Section:** Add screenshots for the following sections:
> 
> 1. **Dashboard Home** - Overview of the application interface
> 2. **Bill Management Page** - List of existing bills
> 3. **Create Bill Form** - New bill creation interface
> 4. **Item Master Database** - Item management interface
> 5. **Payment Tracker** - Payment status overview
> 6. **OCR Scanner** - Image upload and processing
> 7. **Task Management** - To-do list interface
> 8. **Login Page** - Authentication interface


### Dashboard
<img width="1366" height="768" alt="Screenshot (159)" src="https://github.com/user-attachments/assets/a971b734-0f0e-4975-bf23-89d97e56ec7b" />


### Bill Management
<img width="1366" height="768" alt="Screenshot (160)" src="https://github.com/user-attachments/assets/7ebb147c-e769-4749-93af-5b6db65a208d" />


### Create New Bill
<img width="1366" height="768" alt="Screenshot (161)" src="https://github.com/user-attachments/assets/86db1d20-cde6-4c2b-9d9a-5cf01172e1d3" />


---

## Future Improvements

🔮 **Planned Features:**
- 📊 Advanced analytics and reporting dashboard
- 💰 Multi-currency support
- 🌐 Cloud backup and sync capabilities
- 📱 Mobile app companion (React Native/Flutter)
- 🤖 AI-powered bill recommendation engine
- 📧 Email integration for sending invoices
- 📅 Integration with calendar and CRM systems
- 🔔 Automated payment reminders and notifications
- 🌍 Multi-language support (Localization)
- 📈 Expense tracking and financial forecasting
- 🔐 Two-factor authentication
- 🎨 Customizable bill templates and branding
- 🗂️ Folder/category organization for bills
- 📥 Import bills from other formats (CSV, JSON)
- 🔄 Recurring bill templates

---

## Building the Desktop Executable

To package the application as a standalone desktop executable:

### Prerequisites
```bash
pip install pyinstaller pywebview
```

### Build Command

```bash
pyinstaller BillGenerator.spec
```

The executable will be generated in the `dist/` folder:
- **Windows:** `dist/BillGenerator.exe`
- **macOS:** `dist/BillGenerator.app`
- **Linux:** `dist/BillGenerator`

### Distribution

1. Navigate to `dist/` folder
2. Compress the folder
3. Share with users
4. No installation required - just run the executable

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- **RAM:** 2 GB
- **Disk Space:** 500 MB
- **Python:** 3.8+ (if running from source)

### Recommended Requirements
- **OS:** Windows 11, macOS 12+, or Ubuntu 20.04 LTS
- **RAM:** 4 GB+
- **Disk Space:** 1 GB
- **Processor:** Intel/AMD Dual-core 2.0 GHz+

---

## Acknowledgments

- **Flask Community** - Excellent web framework documentation
- **Tailwind CSS** - Modern utility-first CSS framework
- **FontAwesome** - Beautiful icon library
- **EasyOCR** - Powerful OCR capabilities
- **PyWebView** - Bridge between Python and desktop

---

**Built with ❤️ for simplifying billing and invoice management.**
