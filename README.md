# RouteStops

A React-based web application that helps users discover restaurants and attractions along their route or find perfect meetup spots between two locations.

## Features

- **Route Mode**: Find places of interest along your travel route
- **Meetup Mode**: Discover perfect halfway points between two locations
- **Advanced Search**: Filter by distance, categories, and more
- **Real-time Map Visualization**: Interactive maps showing routes and locations
- **Comprehensive Data**: Integration with TripAdvisor for rich location details
- **Distance Calculation**: Accurate distance measurements along routes

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Netlify for hosting and serverless functions
- TripAdvisor API for location data
- Geoapify for maps and routing

## Development

1. Clone the repository:
```bash
git clone https://github.com/jtwave/RouteStops.git
```

2. Install dependencies:
```bash
npm install
cd netlify/functions && npm install
```

3. Create a `.env` file with your API keys:
```
VITE_TRIPADVISOR_API_KEY=your_key_here
VITE_GEOAPIFY_API_KEY=your_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The application is automatically deployed to Netlify when changes are pushed to the main branch.

## Live Site

Visit [routestops.net](https://routestops.net) to see the application in action. 