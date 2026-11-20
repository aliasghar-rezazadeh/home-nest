
# 🏠 HomeNest

<p align="center">
  <strong>Full-Stack E-Commerce Platform for Home Furnishings</strong>
</p>

<p align="center">
  <a href="#فارسی">🇮🇷 فارسی</a>
  &nbsp; | &nbsp;
  <a href="#english">🇬🇧 English</a>
</p>

---

<a id="فارسی"></a>

# 🇮🇷 معرفی پروژه

**HomeNest** یک پلتفرم فروشگاهی فول‌استک برای عرضه محصولات خانه، دکوراسیون و لوازم هوشمند است.

هدف این پروژه ایجاد یک فروشگاه اینترنتی با امکانات کامل مدیریت محصولات، تنوع کالاها، سبد خرید، علاقه‌مندی‌ها، مقایسه محصولات و مدیریت سفارش‌ها است.

این پروژه با استفاده از **Django REST Framework** در بک‌اند و **Next.js** در فرانت‌اند توسعه داده شده و از پایگاه داده **MySQL** استفاده می‌کند.

## ✨ امکانات پروژه

### 🛍️ مدیریت محصولات

- نمایش فهرست محصولات و جزئیات هر محصول
- مدیریت دسته‌بندی‌ها و برچسب‌ها
- پشتیبانی از تصاویر متعدد محصولات
- تعریف ویژگی‌ها و مشخصات محصولات
- پشتیبانی از تنوع محصولات بر اساس رنگ و سایز
- مدیریت موجودی محصولات و تنوع‌ها
- سیستم امتیازدهی و ثبت نظرات کاربران
- محاسبه میانگین امتیاز محصولات و تعداد نظرات
- امکان ویرایش نظر ثبت‌شده توسط کاربر

### 🛒 سبد خرید

- ایجاد سبد خرید اختصاصی برای هر کاربر
- افزودن محصولات به سبد خرید
- پشتیبانی از انتخاب تنوع محصول
- افزایش و کاهش تعداد محصولات
- حذف محصولات از سبد خرید
- محاسبه مجموع قیمت اقلام و کل سبد خرید
- بررسی موجودی هنگام افزودن یا تغییر تعداد محصولات

### ❤️ علاقه‌مندی‌ها (Wishlist)

- افزودن محصولات به فهرست علاقه‌مندی‌ها
- حذف محصولات از فهرست
- جلوگیری از ثبت محصولات تکراری
- نگهداری فهرست اختصاصی برای هر کاربر

### ⚖️ مقایسه محصولات (Compare)

- افزودن محصولات به فهرست مقایسه
- حذف محصولات از مقایسه
- مدیریت وضعیت مقایسه محصولات

### 📦 مدیریت سفارش‌ها

- ثبت سفارش بر اساس سبد خرید کاربر
- ذخیره قیمت محصولات در زمان ثبت سفارش
- مشاهده تاریخچه سفارش‌ها
- مشاهده جزئیات هر سفارش
- مدیریت وضعیت سفارش‌ها
- امکان لغو سفارش در وضعیت مجاز
- بازگرداندن موجودی محصولات در صورت لغو سفارش
- مدیریت سفارش‌ها توسط مدیر سیستم

### 🔐 احراز هویت و سطح دسترسی

- ثبت‌نام و ورود کاربران
- احراز هویت مبتنی بر JWT
- محافظت از APIهای اختصاصی
- مدیریت سطح دسترسی کاربران
- محدودسازی عملیات مدیریتی به مدیر سیستم

---

# ⚙️ معماری و منطق بک‌اند

## فناوری‌های استفاده‌شده

- Python
- Django
- Django REST Framework
- MySQL
- Django Filters
- JWT Authentication

## ساختار برنامه‌های بک‌اند

بک‌اند پروژه به چند اپلیکیشن مستقل تقسیم شده است که هرکدام مسئولیت مشخصی دارند.

| اپلیکیشن | مسئولیت |
|---|---|
| `accounts` | مدیریت حساب کاربران، احراز هویت و مجوزها |
| `products` | محصولات، دسته‌بندی‌ها، تنوع‌ها، نظرات و مشخصات |
| `cart` | مدیریت سبد خرید و اقلام آن |
| `wishlist` | مدیریت فهرست علاقه‌مندی‌ها |
| `orders` | ثبت سفارش، وضعیت سفارش و مدیریت موجودی |
| `core` | امکانات و بخش‌های مشترک پروژه |

## منطق‌های اصلی سیستم

### ۱. مدیریت تنوع محصولات و موجودی

هر محصول می‌تواند چندین تنوع بر اساس رنگ و سایز داشته باشد.

- هر تنوع موجودی مستقل دارد.
- قیمت تنوع‌ها با قیمت اصلی محصول یکسان است.
- انتخاب تنوع محصول در سبد خرید ثبت می‌شود.
- موجودی هنگام افزودن یا تغییر تعداد محصول بررسی می‌شود.

### ۲. قوانین سبد خرید

- هر کاربر احراز هویت‌شده سبد خرید اختصاصی دارد.
- هر قلم سبد خرید بر اساس محصول و تنوع انتخاب‌شده شناسایی می‌شود.
- افزودن مجدد یک تنوع موجود، تعداد همان قلم را افزایش می‌دهد.
- تعداد درخواستی با موجودی قابل دسترس بررسی می‌شود.

### ۳. سیستم نظرات و امتیازدهی

- کاربران می‌توانند برای محصولات امتیاز و نظر ثبت کنند.
- هر کاربر برای هر محصول فقط یک نظر دارد.
- کاربر می‌تواند نظر قبلی خود را ویرایش کند.
- میانگین امتیاز و تعداد نظرات محصولات محاسبه می‌شود.

### ۴. چرخه مدیریت سفارش‌ها

سفارش‌ها از روی سبد خرید کاربر ایجاد می‌شوند.

قوانین اصلی:

- سفارش جدید با وضعیت `pending` ایجاد می‌شود.
- قیمت محصولات هنگام ثبت سفارش ذخیره می‌شود.
- موجودی محصولات پیش از ثبت سفارش بررسی می‌شود.
- موجودی هنگام ثبت سفارش کاهش پیدا می‌کند.
- کاربر فقط می‌تواند سفارش در وضعیت `pending` را لغو کند.
- در صورت لغو سفارش مجاز، موجودی محصولات بازگردانده می‌شود.
- تغییر وضعیت سفارش به عملیات مدیریتی محدود شده است.

### چرخه وضعیت سفارش

```text
Pending
   |
   |----> Paid
   |        |
   |        v
   |     Processing
   |        |
   |        v
   |      Shipped
   |
   |----> Cancelled
```

### ۵. حفظ یکپارچگی اطلاعات

برای جلوگیری از ناسازگاری اطلاعات در عملیات حساس سفارش و موجودی از قابلیت‌های پایگاه داده استفاده شده است.

- Database Transactions
- Atomic Operations
- Row-Level Locking
- کنترل هم‌زمانی در تغییر موجودی
- جلوگیری از انتقال نامعتبر وضعیت سفارش
- حفظ یکپارچگی عملیات ثبت و لغو سفارش

## رویکرد توسعه بک‌اند

بک‌اند این پروژه با استفاده از روش **Vibe Coding** و با کمک ابزارهای هوش مصنوعی توسعه داده شده است.

در فرایند توسعه، از هوش مصنوعی برای کمک به تولید کد، پیاده‌سازی، اشکال‌زدایی و نوشتن تست‌ها استفاده شده است. نیازمندی‌ها، منطق‌های تجاری، ارتباط بین مدل‌ها و رفتار مورد انتظار بخش‌های مختلف سیستم نیز در طول توسعه تعریف و اصلاح شده‌اند.

---

# 🎨 فرانت‌اند و طراحی رابط کاربری

## فناوری‌های استفاده‌شده

- Next.js
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Toastify
- Lucide React

## درباره طراحی فرانت‌اند

طراحی رابط کاربری و پیاده‌سازی بخش فرانت‌اند این پروژه توسط خودم انجام شده است.

برای طراحی HomeNest از پروژه قبلی خودم یعنی **SmartHomeShop** به‌عنوان مرجع طراحی استفاده کردم.

SmartHomeShop پروژه‌ای بود که پیش‌تر با React و Vite توسعه داده بودم. در HomeNest تلاش کردم هویت بصری، چیدمان صفحات و استایل‌های پروژه قبلی را حفظ کنم و آن را به معماری جدید Next.js منتقل کنم.

**پروژه مرجع طراحی:**

[SmartHomeShop - GitHub](https://github.com/aliasghar-rezazadeh/SmartHomeShop)

### مسئولیت‌های فرانت‌اند

- نمایش محصولات و جزئیات آن‌ها
- ارتباط با APIهای بک‌اند
- مدیریت وضعیت ورود کاربران
- مدیریت سبد خرید
- مدیریت علاقه‌مندی‌ها
- مقایسه محصولات
- جست‌وجوی محصولات
- نمایش تنوع محصولات
- نمایش اعلان‌ها و پیام‌های عملیات
- طراحی صفحات و اجزای قابل استفاده مجدد

### اصول طراحی

- حفظ ظاهر و هویت بصری پروژه قبلی
- استفاده مجدد از کامپوننت‌ها
- طراحی ساختار ماژولار
- جداسازی ارتباط با API از اجزای رابط کاربری
- حفظ یکپارچگی استایل‌ها در صفحات مختلف

---

# 🗂️ ساختار پروژه

```text
Home Nest/
│
├── backend/
│   ├── accounts/
│   ├── cart/
│   ├── core/
│   ├── orders/
│   ├── products/
│   ├── wishlist/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── api/
│   ├── context/
│   ├── redux/
│   ├── public/
│   └── package.json
│
├── package.json
├── README.md
└── .gitignore
```

---

# 🚀 راه‌اندازی پروژه

## پیش‌نیازها

برای اجرای پروژه به موارد زیر نیاز دارید:

- Python
- Node.js
- npm
- MySQL
- Git

## ۱. دریافت پروژه

```bash
git clone https://github.com/aliasghar-rezazadeh/home-nest.git

cd home-nest
```

## ۲. راه‌اندازی بک‌اند

وارد پوشه بک‌اند شوید:

```powershell
cd backend
```

ساخت محیط مجازی:

```powershell
python -m venv .venv
```

فعال‌سازی محیط مجازی:

```powershell
.venv\Scripts\Activate.ps1
```

نصب وابستگی‌ها:

```bash
pip install -r requirements.txt
```

تنظیم متغیرهای محیطی و اطلاعات اتصال به پایگاه داده MySQL را مطابق تنظیمات بک‌اند انجام دهید.

اجرای Migrationها:

```bash
python manage.py migrate
```

ساخت حساب مدیر:

```bash
python manage.py createsuperuser
```

اجرای سرور:

```bash
python manage.py runserver
```

آدرس پیش‌فرض بک‌اند:

```text
http://127.0.0.1:8000/
```

## ۳. راه‌اندازی فرانت‌اند

در یک ترمینال جدید:

```powershell
cd frontend
```

نصب وابستگی‌ها:

```bash
npm install
```

اجرای فرانت‌اند:

```bash
npm run dev
```

آدرس پیش‌فرض فرانت‌اند:

```text
http://localhost:3000/
```

## ۴. اجرای هم‌زمان بک‌اند و فرانت‌اند

در ریشه پروژه، پس از نصب وابستگی‌های لازم، دستور زیر هر دو سرور را اجرا می‌کند:

```bash
npm run dev
```

---

# 🧪 تست بک‌اند

بک‌اند پروژه دارای تست‌های خودکار برای بررسی رفتار بخش‌های اصلی سیستم است.

موارد تحت پوشش تست‌ها:

- عملکرد محصولات
- تنوع محصولات و مدیریت موجودی
- عملیات سبد خرید
- عملیات علاقه‌مندی‌ها
- ثبت و لغو سفارش
- تغییر وضعیت سفارش‌ها
- احراز هویت و سطح دسترسی
- یکپارچگی موجودی محصولات

اجرای تست‌ها:

```bash
cd backend

python manage.py test
```

---

# 🔮 برنامه توسعه آینده

برخی از قابلیت‌هایی که می‌توانند در مراحل بعدی به پروژه اضافه شوند:

- اتصال درگاه پرداخت آنلاین
- فیلتر و مرتب‌سازی پیشرفته محصولات
- توسعه پنل مدیریت
- بهبود قابلیت جست‌وجو
- تکمیل صفحات و امکانات فرانت‌اند
- آماده‌سازی تنظیمات Production
- بهبود عملکرد و امنیت برنامه

---

# 👨‍💻 توسعه‌دهنده

**علی‌اصغر رضازاده**

GitHub: [@aliasghar-rezazadeh](https://github.com/aliasghar-rezazadeh)

پروژه مرتبط:

[SmartHomeShop](https://github.com/aliasghar-rezazadeh/SmartHomeShop)

---

<a id="english"></a>

# 🇬🇧 English

# 🏠 HomeNest

**A Full-Stack E-Commerce Platform for Home Furnishings**

HomeNest is a full-stack e-commerce platform designed for selling home furnishings, decoration products, and smart home accessories.

The project provides product management, product variants, shopping cart, wishlist, product comparison, customer reviews, authentication, and order management.

It is built with **Django REST Framework** on the backend and **Next.js** on the frontend, using **MySQL** as its database.

## ✨ Features

### 🛍️ Product Management

- Product listing and product details
- Category and tag management
- Multiple product images
- Product specifications
- Product variants based on color and size
- Product and variant inventory management
- Customer ratings and reviews
- Automatic average rating and review count
- Review editing by the original reviewer

### 🛒 Shopping Cart

- Individual shopping carts for authenticated users
- Add products to the cart
- Support for product variants
- Update item quantities
- Remove cart items
- Calculate item totals and cart totals
- Validate available stock

### ❤️ Wishlist

- Add products to the wishlist
- Remove products from the wishlist
- Prevent duplicate entries
- Maintain a separate wishlist for each user

### ⚖️ Product Comparison

- Add and remove products from comparison
- Manage comparison state

### 📦 Order Management

- Create orders from the user's shopping cart
- Store product price snapshots at order creation
- View order history
- View order details
- Manage order statuses
- Cancel eligible orders
- Restore inventory when an order is cancelled
- Administrative order management

### 🔐 Authentication and Authorization

- User registration and login
- JWT-based authentication
- Protected API endpoints
- Role-based permissions
- Restricted administrative operations

---

# ⚙️ Backend Architecture

## Technologies

- Python
- Django
- Django REST Framework
- MySQL
- Django Filters
- JWT Authentication

## Application Structure

The backend is organized into separate Django applications, each responsible for a specific part of the system.

| Application | Responsibility |
|---|---|
| `accounts` | User accounts, authentication, and permissions |
| `products` | Products, categories, tags, variants, reviews, and specifications |
| `cart` | Shopping cart and cart item management |
| `wishlist` | User wishlist management |
| `orders` | Order creation, status management, and inventory updates |
| `core` | Shared application functionality |

## Core Business Logic

### 1. Product Variants and Inventory

Each product can have multiple variants based on attributes such as color and size.

- Each variant has its own stock quantity.
- Variants do not have separate prices.
- The main product price applies to all variants.
- Stock availability is validated when adding or updating cart items.

### 2. Shopping Cart Rules

- Each authenticated user has an individual shopping cart.
- A cart item is identified by its product and selected variant.
- Adding an existing variant updates its quantity instead of creating a duplicate item.
- Requested quantities are validated against available stock.

### 3. Review System

- Users can submit product ratings and comments.
- Each user can have only one review per product.
- Existing reviews can be updated.
- Product average ratings and review counts are calculated from submitted reviews.

### 4. Order Processing

Orders are created from the authenticated user's shopping cart.

Main business rules:

- New orders are created with the `pending` status.
- Product prices are stored as snapshots at order creation.
- Stock availability is validated before order creation.
- Inventory is reduced when an order is created.
- Users can cancel orders only while they are pending.
- Stock is restored when an eligible order is cancelled.
- Order status updates are restricted to authorized administrators.

### Order Status Flow

```text
Pending
   |
   |----> Paid
   |        |
   |        v
   |     Processing
   |        |
   |        v
   |      Shipped
   |
   |----> Cancelled
```

### 5. Data Consistency

Database features are used to maintain consistency during sensitive order and inventory operations.

- Database transactions
- Atomic operations
- Row-level locking
- Concurrent inventory update protection
- Prevention of invalid order status transitions
- Consistent order creation and cancellation

## Backend Development Approach

The backend was developed using an **AI-assisted Vibe Coding approach**.

Artificial intelligence tools were used to assist with code generation, implementation, debugging, and testing.

The application's requirements, business logic, data relationships, and expected behavior were defined and refined throughout the development process.

---

# 🎨 Frontend and UI Design

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Toastify
- Lucide React

## Frontend Development

The frontend user interface was personally designed and implemented by me.

The design is based on my previous project, **SmartHomeShop**, which I originally developed using React and Vite.

SmartHomeShop served as the visual reference for HomeNest. I used its interface, layouts, and styling as the foundation for migrating the application to Next.js while preserving its original visual identity.

**Reference Project:**

[SmartHomeShop - GitHub](https://github.com/aliasghar-rezazadeh/SmartHomeShop)

### Frontend Responsibilities

- Display products and product details
- Communicate with backend APIs
- Manage authentication state
- Manage shopping cart information
- Manage wishlist interactions
- Handle product comparison
- Search products
- Display product variants
- Show notifications and operation feedback
- Build reusable UI components

### Design Principles

- Preserve the original UI and visual identity
- Reuse existing components where possible
- Maintain a modular component structure
- Separate API communication from UI components
- Keep styling consistent across pages

---

# 🗂️ Project Structure

```text
Home Nest/
│
├── backend/
│   ├── accounts/
│   ├── cart/
│   ├── core/
│   ├── orders/
│   ├── products/
│   ├── wishlist/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── api/
│   ├── context/
│   ├── redux/
│   ├── public/
│   └── package.json
│
├── package.json
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Python
- Node.js
- npm
- MySQL
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/aliasghar-rezazadeh/home-nest.git

cd home-nest
```

## 2. Backend Setup

Navigate to the backend directory:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables and MySQL database connection according to the backend settings.

Run database migrations:

```bash
python manage.py migrate
```

Create an administrator account:

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

Default backend address:

```text
http://127.0.0.1:8000/
```

## 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Default frontend address:

```text
http://localhost:3000/
```

## 4. Run Both Applications

The project root includes scripts for running both applications together.

After installing the required dependencies, navigate to the project root and run:

```bash
npm run dev
```

This starts both the Django backend and Next.js frontend.

---

# 🧪 Backend Testing

The backend includes automated tests for important application behavior.

Test coverage includes:

- Product functionality
- Product variants and inventory
- Shopping cart operations
- Wishlist operations
- Order creation and cancellation
- Order status transitions
- Authentication and permissions
- Inventory consistency

Run backend tests:

```bash
cd backend

python manage.py test
```

---

# 🔮 Future Improvements

Potential future improvements include:

- Online payment gateway integration
- Advanced product filtering and sorting
- Improved administrative dashboard
- Enhanced search functionality
- Additional frontend pages and features
- Production deployment configuration
- Performance and security improvements

---

# 👨‍💻 Developer

**Ali Asghar Rezazadeh**

GitHub: [@aliasghar-rezazadeh](https://github.com/aliasghar-rezazadeh)

Related Project:

[SmartHomeShop](https://github.com/aliasghar-rezazadeh/SmartHomeShop)

---

## 📄 License

This project is developed for educational purposes, personal development, and portfolio presentation.
