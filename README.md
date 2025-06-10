# InstaRent App 🏠

InstaRent is a modern mobile application built with Expo and React Native, designed to facilitate property rentals and management. The app provides a seamless experience for both property owners and renters.

## 🚀 Features

- User authentication and authorization
- Property listing and management
- Location-based search with Google Maps integration
- Real-time messaging and notifications
- Secure payment processing
- Image upload and management
- Responsive and modern UI with NativeWind (TailwindCSS)
- Cross-platform support (iOS & Android)

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS)
- **Database**: Neon Database with Drizzle ORM
- **Authentication**: Better Auth
- **Maps**: Google Maps & React Native Maps
- **State Management**: React Native's built-in state management
- **UI Components**: Expo Vector Icons, React Native Elements

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone [your-repository-url]
   cd instarent-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add necessary environment variables:

   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   DATABASE_URL=your_database_url
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Run on your preferred platform:

   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## 📱 Development

The project uses file-based routing with Expo Router. Main directories:

- `/app` - Main application code and routes
- `/components` - Reusable React components
- `/utils` - Utility functions and helpers
- `/hooks` - Custom React hooks
- `/constants` - Application constants
- `/assets` - Static assets (images, fonts, etc.)
- `/db` - Database schemas and migrations

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes

## 📦 Database Management

The project uses Drizzle ORM with Neon Database. To manage database schemas:

```bash
npm run db:push
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- All contributors who have helped shape this project
