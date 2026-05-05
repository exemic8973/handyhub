# HandyHub - Professional Handyman Service Platform

HandyHub is a full-stack web application that connects customers with professional handymen for home repair and maintenance services. Built with Next.js 14, PostgreSQL, Prisma, and Tailwind CSS.

## 🌟 Features

### For Customers
- **Easy Booking**: Book handyman services with just a few clicks
- **Service Categories**: Plumbing, Electrical, Carpentry, Painting, Cleaning, and more
- **Real-time Tracking**: Track your booking status in real-time
- **Reviews & Ratings**: Rate and review service providers
- **Dashboard**: Manage all your bookings from one place

### For Handymen
- **Professional Profile**: Showcase your skills, experience, and certifications
- **Flexible Scheduling**: Set your own availability
- **Job Management**: Accept, manage, and complete jobs efficiently
- **Earnings Dashboard**: Track your earnings and performance
- **Customer Reviews**: Build your reputation through reviews

### For Administrators (Super Admin)
- **Comprehensive Dashboard**: Overview of all platform activities
- **User Management**: Manage customers and handymen
- **Booking Analytics**: Detailed booking statistics and trends
- **Revenue Tracking**: Monitor platform revenue and growth
- **Service Management**: Add and manage service categories

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with JWT
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- PostgreSQL (or use Docker)
- Git

## 🛠️ Installation & Setup

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/handyhub.git
   cd handyhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/handyman_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb handyman_db
   
   # Push schema to database
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/handyhub.git
   cd handyhub
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start a PostgreSQL database
   - Build and start the Next.js application
   - Set up all necessary environment variables

3. **Access the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
handyhub/
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── api/            # API routes
│   │   │   └── auth/       # Authentication endpoints
│   │   ├── dashboard/      # User dashboard pages
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   └── lib/
│       ├── auth.ts         # NextAuth configuration
│       └── prisma.ts       # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── config.ts           # Prisma config
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🔑 Default Credentials

After setting up the database, you can create accounts through the registration page:

### Admin Account
Create an admin account by registering and then updating the user role in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@handyhub.com';
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status

### Users
- `GET /api/users` - Get users (admin only)
- `PUT /api/users/:id` - Update user profile

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (admin only)

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
colors: {
  primary: {
    // Your primary colors
  },
  accent: {
    // Your accent colors
  }
}
```

### Branding
Update the following files to customize branding:
- `src/app/layout.tsx` - App title and metadata
- `src/app/page.tsx` - Landing page content
- `src/app/globals.css` - Global styles

## 🚀 Deployment

### Deploy to Zeabur
1. Push your code to GitHub
2. Connect your GitHub repo to Zeabur
3. Add environment variables in Zeabur dashboard
4. Deploy!

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy with Docker
```bash
# Build the image
docker build -t handyhub .

# Run the container
docker run -p 3000:3000 handyhub
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | JWT secret key | Yes |

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue or contact us at support@handyhub.com.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Heroicons](https://heroicons.com/)

---

**HandyHub** - Making home repairs easy and accessible for everyone! 🏠🔧