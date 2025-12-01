# Gemstone Lights AI

An AI-powered image generation tool for visualizing permanent lights on house roofs. Draw lines along roof edges, adjust light density, and generate realistic previews.

## Features

- 📸 Upload house photos
- ✏️ Draw segments along roof edges with interactive nodes
- 🔍 Zoom and pan for precise placement
- 💡 Adjust light density per segment
- 🎨 Multiple color-coded segments
- 📱 Mobile-optimized iPhone frame UI
- 💾 Download generated images
- 📜 View generation history

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemstone-lights-ai.git
cd gemstone-lights-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Upload a Photo**: Click "Upload a Photo" to select a house image
2. **Add Segments**: Click on the image to place nodes and create light segments along roof edges
3. **Adjust Density**: Select each segment and use +/- buttons to adjust light spacing
4. **Generate**: Click "Done" to generate the final image with lights
5. **View History**: Access previously generated images and download them

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### GitHub Pages

1. Update `vite.config.js` with your repository name:
```js
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
})
```

2. Build and deploy:
```bash
npm run build
npm run deploy
```

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
