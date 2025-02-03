# Smart Notes PWA

A Progressive Web Application for taking notes with photos and location support.

## Features

- Create notes with text and photos
- Add location to notes
- Works offline
- Installable as a PWA
- Dark/Light theme support
- Responsive design

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
python -m http.server 8000
# or
npm install -g http-server
http-server
```

Then open http://localhost:8000 in your browser.

## Building Icons

The icons were generated from SVG using Sharp:
```bash
node convert-icons.js
```

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Service Workers
- Cache API
- IndexedDB
- Geolocation API
- Camera API
