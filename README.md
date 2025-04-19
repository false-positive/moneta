<p align="center">
  <img width=256px src="./assets/logo.svg" />
  <h1 align="center">Moneta</h1>
  <p align="center">Interactive financial literacy platform through life simulations</p>
</p>

## Testing

Moneta has comprehensive unit tests to ensure reliability and stability:

```bash
# Navigate to the web directory
cd web

# Run all unit tests
npm run test

# Run tests in watch mode during development
npm run test:watch
```

## What is Moneta?

Moneta is an interactive web platform that helps children and students build financial literacy through realistic simulations. Users take on the role of financial advisors, helping virtual friends manage their money through different life stages. Each decision shapes their future - leading to different outcomes and visualizations of potential life paths.

The platform includes:

- Life simulation with real financial scenarios
- Financial metrics visualization (joy, free time, budget)
- Multiple investment options with different risk/reward profiles
- Career and education path decisions
- Long-term impact visualization of financial choices

## Features

- **Interactive Cases**: Guide virtual characters through financial decisions
- **Dynamic Simulation**: See how choices affect finances over time
- **Metric Tracking**: Monitor budget, joy, and free time
- **Financial Education**: Learn about investments, loans, and savings
- **Visual Analytics**: Charts and graphs show financial progress
- **Unit Testing**: Comprehensive test suite ensures reliability

## Technologies

The project is built with modern web technologies:

### Frontend

- Next.js (React)
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Vitest for unit testing

### Backend

- Flask API
- Python for financial simulations
- Whisper for audio processing

## Architecture

Moneta follows a client-server architecture:

1. **Web Client**: Next.js application that provides the user interface
2. **Flask API**: Handles financial simulations and provides data to the frontend
3. **Unit Tests**: Ensure the simulation logic works correctly

## Project Structure

```
moneta/
├── web/                # Next.js frontend
│   ├── app/            # Pages and routes
│   ├── components/     # UI components
│   ├── lib/            # Core simulation logic
│   │   └── cases/      # Financial case simulations
│   │       └── __tests__/ # Unit tests
├── services/           # Backend services
│   └── flask/          # Flask API for simulations
```
