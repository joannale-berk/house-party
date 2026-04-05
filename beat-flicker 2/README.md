# Beat Flicker

Gesture-controlled house music party app. Flick two fingers up to drop the beat.

## Adding Your Songs

1. Put your MP3 files into the `public/sound for someone/` folder
2. Open `src/lib/houseTracks.ts`
3. Uncomment and edit the entries in the `TRACKS` array:

```ts
const TRACKS: HouseTrack[] = [
  { id: 1, title: "Song Name",   artist: "Artist", url: "/sound for someone/mysong.mp3" },
  { id: 2, title: "Another One", artist: "Artist", url: "/sound for someone/song2.mp3" },
];
```

The `url` must start with `/sound for someone/` followed by the exact filename including extension.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Connect repo to Vercel
3. Vercel settings:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Deploy

## Local Dev

```bash
npm install
npm run dev
```
