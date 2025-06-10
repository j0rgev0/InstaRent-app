# InstaRent App 🏠

InstaRent is a cross-platform mobile application built with React Native and Expo that serves as a comprehensive property rental and sales marketplace. The application enables users to browse, publish, and manage property listings while facilitating direct communication between property owners and potential renters or buyers through an integrated real-time chat system.

## 🚀 Features

- User authentication and authorization with Better Auth
- Property listing and management system
- Location-based search with Google Maps integration
- Real-time messaging and notifications using Socket.IO
- Secure payment processing
- Image upload and management with Cloudinary
- Responsive and modern UI with NativeWind (TailwindCSS)
- Cross-platform support (iOS, Android & Web)

## 🛠️ Technology Stack

| Category           | Primary Technologies               | Key Packages                          |
| ------------------ | ---------------------------------- | ------------------------------------- |
| **Framework**      | React Native 0.79.2, Expo ~53.0.7  | expo, react-native                    |
| **Navigation**     | Expo Router ~5.0.5                 | expo-router                           |
| **Authentication** | Better Auth ^1.2.7                 | better-auth, @better-auth/expo        |
| **Database**       | Neon PostgreSQL with Drizzle ORM   | @neondatabase/serverless, drizzle-orm |
| **Real-time**      | Socket.IO ^4.8.1                   | socket.io-client                      |
| **Maps**           | Google Maps & Expo Maps            | react-native-maps, expo-maps          |
| **Styling**        | NativeWind (Tailwind CSS)          | nativewind, tailwindcss               |
| **Image Handling** | Expo Image & Image Picker          | expo-image, expo-image-picker         |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Git

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/j0rgev0/InstaRent-app
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
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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

## 📱 Application Architecture

### Core System Components

1. **Authentication and Session Management**
   - Robust authentication system using Better Auth
   - Session persistence and automatic routing
   - Authentication state management in root layout

2. **Real-time Communication**
   - Centralized Socket.IO provider
   - Live chat functionality
   - Real-time notifications

3. **Navigation Architecture**
   - File-based routing with Expo Router
   - Logical grouping of routes
   - Type-safe routing

### External Service Integrations

#### Database and Backend Services

- **Neon Database**: PostgreSQL hosting with Drizzle ORM
- **INSTARENT_API**: Backend API for properties and users
- **Resend**: Email service for authentication

#### Location and Media Services

- **Google Maps**: Location services and geocoding
- **Cloudinary**: Image storage and optimization
- **Expo Location**: Device location access

## 📁 Project Structure

```
instarent-app/
├── app/                 # Main application routes
├── components/          # Reusable components
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── constants/          # App constants
├── assets/             # Static assets
├── db/                 # Database schemas and migrations
├── lib/                # Library configurations
└── scripts/            # Build and utility scripts
```

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

## 🛠️ Development Workflow

1. **Branch Management**
   - `main` - Production-ready code
   - `develop` - Development branch
   - Feature branches should be created from `develop`

2. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint and Prettier for code formatting
   - Write meaningful commit messages

3. **Testing**
   - Test on both iOS and Android platforms
   - Ensure responsive design works on different screen sizes
   - Test all user flows before submitting PR

## 🔍 Troubleshooting

Common issues and solutions:

1. **Metro Bundler Issues**

   ```bash
   # Clear Metro bundler cache
   npm start -- --clear
   ```

2. **Build Failures**

   ```bash
   # Clean and rebuild
   rm -rf node_modules
   npm install
   ```

3. **Database Connection Issues**
   - Verify DATABASE_URL in .env
   - Check network connectivity
   - Ensure database credentials are correct

## 📱 Platform-Specific Notes

### iOS

- Requires Xcode 14 or later
- Minimum iOS version: 13.0
- Requires Apple Developer account for deployment
- Location services permissions required

### Android

- Requires Android Studio
- Minimum Android version: 6.0 (API level 23)
- Requires Google Play Developer account for deployment
- Edge-to-Edge UI enabled
- Location services permissions required

## 🔐 Security Considerations

- Never commit sensitive data or API keys
- Use environment variables for configuration
- Implement proper authentication and authorization
- Follow security best practices for data handling
- Secure API key management for Google Maps and Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Pull Request Guidelines

- Update documentation for new features
- Add tests for new functionality
- Ensure all tests pass
- Follow the existing code style
- Update the changelog if necessary

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

### License Restrictions

- This software is free and open source
- Commercial use is not permitted without explicit permission
- Any modifications must be released under the same license
- If you use this software in a network service, you must provide the source code to users
- You must include the original copyright notice and license text in any distribution

For more information about the AGPL-3.0 license, visit: <https://www.gnu.org/licenses/agpl-3.0.html>

## 👥 Authors

- Jorge Vivar - Initial work

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- All contributors who have helped shape this project

## 📞 Support

For support, please:

1. Check the [documentation](https://docs.expo.dev)
2. Open an issue in the repository
3. Contact the maintainers

## 📈 Roadmap

- [ ] Enhanced search filters
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Push notifications
- [ ] Social media integration
- [ ] Advanced property analytics
- [ ] Virtual property tours
- [ ] Automated property valuation
- [ ] Integration with property management systems
