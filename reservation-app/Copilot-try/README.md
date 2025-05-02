# Reservation App

A mobile application for managing hotel reservations, built with React Native and Expo.

## Features

- Reservation management for staff and customers
- Check-in and check-out functionality
- Geofencing capabilities for venue monitoring
- Status tracking for reservations
- Staff notes and special requests handling

## Getting Started

### Prerequisites

- Node.js (>=14.17)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/reservation-app.git
cd reservation-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

## Deployment

### Prerequisites for Deployment

1. Create an [Expo account](https://expo.dev/signup)
2. Install EAS CLI
```bash
npm install -g eas-cli
```
3. Login to your Expo account
```bash
eas login
```

### Building for Testing (Preview)

To create a build for internal testing:

```bash
npm run build:preview
```

### Production Deployment

To create a production build:

```bash
npm run build:production
```

### Submitting to App Stores

For iOS:
```bash
npm run submit:ios
```

For Android:
```bash
npm run submit:android
```

## Environment Variables

The app uses the following environment files:
- `.env.development` - Used during development
- `.env.production` - Used for production builds

## License

This project is licensed under the Apache 2.0 License - see the LICENSE.txt file for details.
