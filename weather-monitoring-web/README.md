# Weather Monitoring Web Application

This project is a weather monitoring web application built with React and TypeScript. It allows users to search for weather information based on their location and displays relevant data such as temperature, humidity, and weather conditions.

## Project Structure

```
weather-monitoring-web
├── public
│   └── index.html          # Main HTML document
├── src
│   ├── main.tsx           # Entry point for the React application
│   ├── App.tsx            # Main application component
│   ├── components          # Reusable components
│   │   ├── WeatherCard.tsx # Component to display weather information
│   │   └── SearchBar.tsx   # Component for user input
│   ├── pages              # Application pages
│   │   └── Home.tsx       # Main page of the application
│   ├── services           # API interaction
│   │   └── weatherApi.ts   # Functions to fetch weather data
│   ├── hooks              # Custom hooks
│   │   └── useWeather.ts   # Hook for managing weather data
│   ├── styles             # CSS styles
│   │   └── globals.css     # Global styles
│   └── types              # TypeScript types
│       └── index.d.ts      # Type definitions
├── package.json           # npm configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd weather-monitoring-web
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- Use the search bar to enter a location and retrieve weather information.
- The weather card will display the current temperature, humidity, and weather conditions for the specified location.

Important: the app uses OpenWeatherMap and requires an API key. If you see a 401 or "Failed to fetch" error, set your API key in a Vite env variable:

1. Copy `.env.example` to `.env.local` in the project root.
2. Edit `.env.local` and set your key:

```
VITE_OPENWEATHER_KEY=your_actual_api_key_here
```

3. Restart the dev server: `npm run dev`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
 
## Deployment

Two simple ways to publish this site so it's accessible to everyone:

1) GitHub Pages (Automatic with GitHub Actions)

   - Push your repo to GitHub on the `main` branch. The included GitHub Actions workflow `.github/workflows/deploy.yml` will build and publish `dist/` to the `gh-pages` branch automatically.
   - After the workflow runs, enable GitHub Pages on the repository settings to serve the `gh-pages` branch.

2) Docker + Nginx (Self-hosted)

   - Build the Docker image and run it on a server:

```bash
docker build -t weather-monitor:latest .
docker run -p 80:80 weather-monitor:latest
```

   - Visit your server's public IP or domain on port 80 to see the app.

Notes:
 - I added dynamic imports for heavy components (charts, Leaflet) to reduce initial bundle size.
 - There's a helper script `scripts/deploy_github.sh` that uses the GitHub CLI to create a repo and enable Pages. Run it locally after authenticating with `gh`.

3) Vercel (recommended for simple public hosting)

   - Install the Vercel CLI and login:

```bash
npm i -g vercel
vercel login
```

   - Deploy the app in production mode (this runs `npm run build` and uploads `dist/`):

```bash
npm run build
npm run deploy:vercel
```

   - Alternatively, connect the GitHub repo to Vercel via the Vercel web UI for automatic deploys on push.