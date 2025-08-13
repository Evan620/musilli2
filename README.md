# Musilli Homes - Real Estate Platform

A modern real estate platform built with React, TypeScript, and Vite, featuring luxury property listings, land sales, and architectural designs.

## Features

- 🏠 **Property Listings**: Browse luxury rentals, land plots, and architectural designs
- 🔐 **Authentication**: Email/password login and Google Sign-In
- 📱 **Responsive Design**: Mobile-first approach with modern UI
- 🎨 **3D Effects**: Advanced CSS animations and scroll effects
- 🔍 **Interactive Search**: Smart property search with filters
- 💰 **Mortgage Calculator**: Built-in mortgage calculation tool
- 📊 **Dashboard**: Provider dashboard for property management
- 🎯 **Real-time Features**: Live activity feed and notifications

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Google OAuth 2.0
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and navigate to project:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project can be deployed to any static hosting service:

### Vercel
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Deploy dist folder to gh-pages branch
```

## Custom Domain Setup

You can connect a custom domain through your hosting provider's domain settings.
