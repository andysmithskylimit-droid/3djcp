# JCP Lawn Service — immersive 3D website

A responsive website built around one persistent, full-screen Three.js garden. Scrolling moves the camera through the same world. The site uses GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.11, and Three.js 0.170.0, bundled locally in `dist/vendor`.

## Interactive experience

- Drag the 3D garden to orbit it, with a reset-view control.
- Select a service to change the camera angle.
- Click the lawn to drive the mower to a point, hold arrow keys, or use touch direction controls.
- Mowing changes the individual grass heights and tracks the percentage cut. The mower wheels turn and grass clippings fly.
- Auto mow demonstrates a complete route; Grow it back resets the lawn.
- Daylight / Golden dusk changes the scene lighting and illuminates garden lights.
- Ambient grass, tree and particle movement can be paused. Reduced-motion preference pauses ambient animation by default.

The scene is a procedural illustration, not a photograph or a real project claim. The primary experience uses real 3D geometry. No 3D model downloads or external 3D assets are required.

## Preview and hosting

Run `node preview.cjs` and open http://127.0.0.1:4173. For any static web host, upload the contents of `dist`. No build step or API keys are required. Google Fonts and the supplied Google Maps embed require an internet connection.

## Contact behavior

The estimate form validates required fields and creates a reviewable email draft addressed to juancpantoja78@gmail.com. The visitor must click “Open email to send” and send from their email app. A copy option is also included. The website does not send or store enquiries, and no email delivery or booking backend is configured.

All supplied business contact details are included. Suggested service interests are framed as enquiries, with scope and scheduling to be confirmed by JCP. No customer reviews, business years, ratings, prices, or project results have been invented.

## Accessibility and motion

Keyboard navigation, native accessible dialogs with focus return, visible focus indicators, mobile menu, reduced-motion support, paused rendering in hidden tabs, WebGL fallback imagery, native form validation, and descriptive imagery are included. Text and direct contact links remain visible without JavaScript. Google Fonts and Google Maps remain external resources.

## Custom image

The built-in image generation tool created `dist/assets/garden.png`. It is garden inspiration, not a photograph of a completed JCP project. The 3D garden is also illustrative.

Final generation prompt: “Use case: photorealistic-natural. Asset type: full-bleed landscape hero photograph for a premium California lawn-care website. Create a wide 16:9 editorial architectural garden photograph: lush freshly mown deep emerald green lawn with beautifully defined subtle alternating mowing stripes, elegant curving garden beds, mature leafy trees, carefully clipped shrubs and small white flowers. A warm contemporary single-storey Northern California home only partially visible in the far right background. Camera at low human height looking across the lawn. Main lawn dominates bottom two thirds, trees frame top, luminous late-afternoon sunlight from upper right, rich natural greens and warm golden highlights, tactile real grass, no artificial oversaturated greens. LEFT HALF is darker shaded lawn and foliage with quiet visual detail allowing white website type to be overlaid later. Premium landscape editorial photography, peaceful aspirational but believable residential yard. No text, no typography, no watermarks, no people, no logos.”

## Checks performed

- JavaScript syntax validation.
- Desktop visual review of the full-screen garden and mowing playground; no browser console errors during the reviewed flow.
- Auto mowing visibly increased completion to 44%, with cut paths and dusk lights verified visually. Lawn reset and manual direction controls were checked.
- Mobile viewport review at 390 × 844, navigation open/close, scene/control composition, and horizontal overflow check.
- Estimate preparation with sample data; no email sent.

No test enquiry was sent. Google Maps is an external embed and remains subject to Google's availability.
