# Product Images Documentation

## Storage
Product images are stored as absolute URLs in the `products` table of the MySQL database:
- `image`: The main image URL.
- `images`: A JSON string array of additional image URLs.

## Loading
Images are loaded dynamically using the standard `<img src={product.image} />` HTML element within React components.

## Blank Placeholders Issue
Some products display blank placeholders because:
1. The `product.image` field is `null` or empty (which currently falls back to a `<ImageIcon>` component properly).
2. The `product.image` contains an invalid, expired, or broken URL (like dead links from external sources). When this happens on `<img src={url} />` tags without an `onError` handler, the browser renders a broken image icon or a blank space, failing to show the fallback icon.

## Fix
To fix the broken images issue across the app, an `onError` attribute has been added to the `<img />` tags in `LandingPage.tsx` and `Products.tsx`, ensuring that any failing image loads fall back to the `<ImageIcon>` component, mirroring the behavior in `ProductDetail.tsx`.

## Recommendations
- **Image Folder Location:** It is recommended to implement durable cloud storage (e.g., AWS S3, Cloudinary) or a local `/public/products` directory for serving static assets rather than relying entirely on external URLs like Unsplash.
- **Recommended Image Resolution:** 800x600 px (or similar to match the 4:3 aspect ratio).
- **Recommended Aspect Ratio:** 4:3 (as seen in the `aspect-[4/3]` tailwind classes in the UI).
- **Recommended File Formats:** WebP, JPEG, PNG.
- **Optimization Recommendations:**
  - Convert images to WebP before storing to save bandwidth.
  - Implement a backend thumbnail generation step or use a CDN to compress and resize images on the fly.
  - Apply `loading="lazy"` on image tags where appropriate to improve page load speeds.
