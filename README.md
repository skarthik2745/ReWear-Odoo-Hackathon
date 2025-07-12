# ReWear - Community Clothing Exchange Platform

Team Name : Tech Stars
Team Members : Karthik S, Bhavani Sankar M

A web-based platform that connects donors and receivers to reduce textile waste, build community, and make kindness stylish.

## 🚀 Recent Updates

### ✅ Fixed Navigation Bar

- **Landing Page Navigation**: All menu items (Home, Browse Items, Donate Clothes, About, Login, Register) are now visible on the landing page
- **Responsive Design**: Clean, responsive navigation that works across all screen sizes
- **Role-Based Access**: Authenticated users see additional dashboard and profile options

### ✅ Fixed Image Upload & Display

- **Firebase Storage Integration**: Images are now properly uploaded to Firebase Storage
- **Real-time Display**: Uploaded images appear immediately in the Browse Items page
- **Image Preview**: Donors can preview images before uploading
- **Fallback Images**: Graceful handling when images fail to load
- **Image Modal**: Click to view images in full size

## 🛠 Technical Implementation

### Image Upload Flow

1. **Donor uploads image** via donate form
2. **Image validation** (file type, size < 5MB)
3. **Upload to Firebase Storage** with unique filename
4. **Save metadata to Firestore** with image URL
5. **Display in Browse Items** with proper error handling

### Database Structure

```javascript
// Items Collection
{
  title: "Blue Denim Jacket",
  category: "Men",
  size: "Medium",
  condition: "Excellent",
  images: ["https://firebase-storage-url.com/image.jpg"],
  donorName: "John Doe",
  donorEmail: "john@example.com",
  status: "available",
  createdAt: timestamp,
  badges: ["🟢"]
}
```

## 🚀 How to Run

### Prerequisites

- Python 3.x (for local server)
- Modern web browser
- Internet connection (for Firebase services)

### Quick Start

1. **Clone or download** the project files
2. **Open terminal/command prompt** in the project directory
3. **Start local server**:
   ```bash
   python -m http.server 8000
   ```
4. **Open browser** and navigate to: `http://localhost:8000`

### Alternative: Live Server

If you have VS Code with Live Server extension:

1. Right-click on `index.html`
2. Select "Open with Live Server"

## 📱 Features

### For Donors

- ✅ Upload clothing items with images
- ✅ Provide detailed item information
- ✅ Track donation history
- ✅ Earn badges and recognition

### For Receivers

- ✅ Browse available items
- ✅ View high-quality images
- ✅ Filter by category, size, condition
- ✅ Request items from donors
- ✅ Contact donors directly

### General Features

- ✅ Responsive design for all devices
- ✅ Real-time image upload and display
- ✅ User authentication system
- ✅ Clean, modern UI/UX
- ✅ Firebase backend integration

## 🔧 File Structure

```
ReWear/
├── index.html              # Landing page
├── donate.html             # Donation form
├── browse.html             # Item browsing
├── login.html              # User login
├── register.html           # User registration
├── about.html              # About page
├── css/
│   └── style.css           # Main styles
├── js/
│   ├── donate.js           # Donation functionality
│   ├── browse.js           # Browsing functionality
│   ├── user.js             # User management
│   └── auth.js             # Authentication
├── firebase.js             # Firebase configuration
└── README.md               # This file
```

## 🌟 Key Improvements Made

1. **Navigation Fix**: All menu items now visible on landing page
2. **Image Upload**: Complete Firebase Storage integration
3. **Image Display**: Proper rendering with fallbacks
4. **Error Handling**: Graceful handling of missing images
5. **User Experience**: Enhanced image preview and modal viewing
6. **Responsive Design**: Works perfectly on all screen sizes

## 🔗 Firebase Services Used

- **Authentication**: User login/registration
- **Firestore**: Item and user data storage
- **Storage**: Image file storage
- **Real-time Database**: Live updates

## 🎯 Next Steps

- [ ] Add image compression for better performance
- [ ] Implement item search functionality
- [ ] Add user ratings and reviews
- [ ] Create mobile app version
- [ ] Add donation analytics dashboard

---

**Built with ❤️ for the Odoo Hackathon**
