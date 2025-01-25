# 🛒 E-Commerce Backend API

Welcome to the E-Commerce Backend project! This repository contains the backend code for a fully functional e-commerce platform, providing key features like user authentication, product and category management, shopping cart operations, order processing, and secure payment integration.

## 🌟 **Project Overview**

This backend system is designed to handle all the crucial aspects of an e-commerce platform, including:

- **User Authentication & Authorization**: Secure registration with email verification, password reset via email, and login using JWT tokens.
- **Product & Category Management**: Full CRUD operations for categories, subcategories, brands, and products (admin-specific APIs).
- **Shopping Cart & Order Management**: Add/remove products to/from the cart, place orders, and receive invoices via email.
- **Coupon System**: Manage discount codes to enhance user engagement and sales.
- **User Reviews & Wishlist**: Users can leave product reviews and manage wishlists.

## 🚀 **Key Features**

1. **User Authentication & Authorization**
   - Secure sign-up with email verification.
   - Password reset via email.
   - JWT-based login for protected routes.

2. **Product & Category Management**
   - CRUD operations for managing categories, subcategories, brands, and products.
   - Admin-specific APIs for advanced control.

3. **Shopping Cart & Order Management**
   - Users can add or remove products from the cart.
   - Complete order placement with Stripe payment integration.
   - Invoices are automatically sent via email once an order is confirmed.

4. **Coupon System**
   - Create and manage discount coupons.
   - Apply coupons during checkout for discounted purchases.

5. **User Reviews & Wishlist**
   - Users can leave reviews and ratings on products.
   - Manage a wishlist for favorite products.

6. **Advanced Features**
   - Pagination, filtering, sorting for product listings.
   - Error handling and rollback delete to maintain data integrity.

## 🛠 **Tech Stack**

- **Node.js & Express.js** for building the backend RESTful API.
- **MongoDB** with **Mongoose** for efficient data storage and management.
- **Multer & Cloudinary** for handling file uploads and cloud storage for images.
- **Nodemailer** for sending email notifications (e.g., email verification, invoice emails).
- **Stripe** for secure payment processing.
- **JWT & Bcrypt** for user authentication and password encryption.
- **Joi** for request validation and ensuring data consistency.

## 📚 **API Documentation**

You can explore and test the available API endpoints using the [Postman Documentation](https://documenter.getpostman.com/view/32929754/2sAXjDfbGR).

## 🔗 **Project Setup**

1. Clone the repository:
   ```bash
   git clone https://github.com/yosseftarek/Ecommerce.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Ecommerce
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Set up your environment variables. Create a `.env` file with the following variables:
   ```bash
   MONGO_URI=your_mongo_database_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Start the server:
   ```bash
   npm start
   ```

## 🧪 **Testing the APIs**

You can test the APIs locally or on your deployed instance by using tools like [Postman](https://www.postman.com/). The API documentation linked above provides details on each endpoint.

## ⚙️ **Contributing**

Contributions are welcome! Feel free to fork this repository, make your changes, and submit a pull request. If you encounter any issues, open an issue in the repository.

---
