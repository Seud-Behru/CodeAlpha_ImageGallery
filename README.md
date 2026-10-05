# CodeAlpha_ImageGallery

Task 1 of the CodeAlpha Frontend Development internship: an image gallery built with HTML, CSS and JavaScript.

## Features
- Responsive masonry layout (3 columns on desktop, fewer on smaller screens)
- Lightbox with next / previous buttons, keyboard arrows, Esc to close and touch swipe
- Hover zoom and caption effects, smooth fade transitions
- Bonus: category filters (All, Nature, Animals, Urban) with photo counts

## Run it
Open `index.html` in a browser. Photos load from picsum.photos, so you need an internet connection.

## Use your own photos
In `script.js`, change an entry in the `IMAGES` array to use a local file:
`{ file: "images/my-photo.jpg", w: 3, h: 2, cat: "nature", title: "My photo" }`
(`w` and `h` are just the tile shape, for example 3:2 or 4:5).

## Files
- `index.html`: page structure and lightbox markup
- `style.css`: layout, hover effects, transitions
- `script.js`: gallery data, filtering, lightbox logic
