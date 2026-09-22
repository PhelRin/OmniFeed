# OmniFeed

A beautiful, lightweight, transparent, and lockable desktop overlay application that merges **Twitch, Kick, and YouTube** chat streams into a single unified feed. Designed for streamers who want to read their chat, celebrate follow events, subscriber milestones, custom channel point redemptions, Super Chats, and donation tips effortlessly on a single-monitor setup.

---

## 🌟 Key Features

### 🔒 Seamless Lock & Click-Through (`Ctrl + Shift + L`)
- **Unlocked Mode**: Draggable title bar, resizable borders, settings access, and a quick-lock button.
- **Locked Mode**: Window chrome disappears, background turns transparent, and the overlay becomes **completely click-through**, allowing mouse clicks to pass straight through to your game or desktop.
- **Floating Unlock Button**: A subtle `🔓 Unlock` button remains cleanly clickable in the bottom corner so you can unlock the overlay with a click even without using hotkeys.
- **Fullscreen Alt-Tab Immunity**: Elevated to the Windows `screen-saver` z-order tier with active watchdog guards, ensuring OmniFeed stays visible on top of fullscreen and borderless games when alt-tabbing.

### 🎨 7TV, BetterTTV & Twitch Emote Supercharge
- **Animated & Static Emotes**: Automatically renders `.webp` and static emotes from **7TV** and **BetterTTV (BTTV)** in your chat.
- **Cross-Platform**: Emotes typed in Twitch, Kick, or YouTube are parsed and rendered directly in the feed.
- **Global & Channel Emote Sets**: Automatically pulls global 7TV/BTTV libraries plus your personal Twitch and Kick channel emote sets.
- **Twitch Global & Subscriber Emotes**: Pre-seeded with baseline Twitch global emotes (`LUL`, `Kappa`, `PogChamp`, `BibleThump`, etc.) and pulls full Twitch Helix global and custom subscriber emotes (`phelriRAID`, `phelriLGOB`, etc.) across all connected platforms.
- **HTML-Safe Tokenizer**: Preserves native platform icons, subscriber badges, and formatting without broken image tags.

### 📺 Tri-Platform Chat Integration
- **Twitch IRC**: High-stability WebSocket connection (`wss://irc-ws.chat.twitch.tv`) streaming messages, badges, and native Twitch emotes.
- **Kick Chat**: Direct Pusher WebSocket streaming (`wss://ws-us2.pusher.com`) capturing messages, broadcaster/moderator/sub badges, and native Kick emotes.
- **YouTube Live Chat**: Connect by simply entering your **Channel Handle** (e.g. `@YourHandle`), **Channel ID**, or direct stream link—**zero Google Cloud API keys or OAuth setup required**!
- **Ultra-Low Latency**: Optimized YouTube polling loop delivering chat in ~1.2 seconds.

### 🗣️ Text-To-Speech (TTS) & Spam Protection
- **Emergency Mute / Skip Hotkey (`Ctrl + Shift + K`)**: Global system shortcut that instantly cancels active voice speech and flushes queued messages without losing focus from your game.
- **Max Character Limit Slider**: Configurable truncation (50–500 characters, default: 200). Walls of spam text are cleanly cut off with `...` before speech begins.
- **Smart URL Sanitization**: Prevents reading out long, spammy web addresses (replaces them with a natural "link" or "links").
- **Voice Timbre Presets**: Choose between Deep Male, Standard Male, Standard Female, High Female, or Random Voice pitch.
- **Permission Modes**: Enable for everyone, restrict to subscribers/VIPs/mods, or require a command prefix (`!tts <message>`).

### 🪙 Alerts, Redemptions & Donations
- **Twitch Channel Points (EventSub)**: Captures both text-prompted and text-free custom reward redemptions (e.g. sound triggers, hydrate, `BROTHAAA!!`) with gold event cards and sound chimes.
- **Expired Session Detection**: Automatically checks Twitch token health on launch and provides a one-click **Reconnect Twitch** button that preserves your Client ID.
- **YouTube Super Chats**: Highlights paid Super Chats with custom gold-and-red contribution badges and automatic TTS readouts.
- **StreamElements Tip Alerts**: Connect via JWT Token to receive real-time emerald green tip/donation cards (`💸 Username tipped $5.00: "message!"`) and voice announcements.
- **Twitch Follower & Kick Sub Alerts**: Real-time notifications for incoming followers, subs, and gifted sub trains.

### 📊 Stream Widgets & Sticky Header
- **Live Viewer Counter**: Track concurrent viewers in combined total (`👥`) or separate platform counters (`🟣 / 🟢 / 🔴`).
- **Live Stream Uptime Timer**: Automatically detects stream start and displays an elapsed timer (`01:24:35`) that handles clock drift seamlessly.
- **Sticky Widget Pinning**: Counters and uptime remain pinned at the top when you scroll up to inspect chat history.
- **Chat Pause on Scroll**: Automatically pauses auto-scroll when reading older messages and resumes when scrolled back to the bottom.

### 🎨 Visual Themes & Customization
- **Themes**: Choose between **Glassmorphism** (modern frosted glass with neon accents), **Minimalist** (borderless text HUD), or **Retro Terminal** (CRT scanlines and monospace styling).
- **Readability**: Double-layered text outline shadow ensuring 100% legibility over any bright or dark game background.
- **Custom Sliders**: Adjust background opacity (0%–100%), font size (12px–28px), and optional message fadeout timers (5s–120s or never fade).
- **Built-in Sound Synthesizer**: Web Audio chimes and pops with no external audio assets needed.

---

## 📥 Installation

1. Go to the **Releases** section of this repository.
2. Download the latest **`OmniFeed.exe`** portable executable.
3. Run `OmniFeed.exe` directly—**no installation or installer required!**

---

## ⚙️ How to Configure

1. **Launch OmniFeed**: The app starts in **Unlocked Mode** by default.
2. **Reposition & Resize**: Drag the window using the top title bar and drag edges to adjust the size.
3. **Open Settings**: Click the **Gear icon (⚙️)** in the top-right header:
   - **Twitch Channel**: Enter your Twitch username.
   - **Twitch Account (Optional)**: Click **Connect Twitch** to authorize follows, EventSub redemptions, and subscriber emotes.
   - **Kick Channel**: Enter your Kick username and click **Auto-Resolve** to fetch your Chatroom ID.
   - **YouTube Channel**: Enter your YouTube handle (e.g. `@YourHandle`) or channel link.
   - **StreamElements (Optional)**: Paste your JWT Token from StreamElements account settings for tip alerts.
   - **Visuals & TTS**: Configure your theme, opacity, font size, sound type, TTS voice, and character limits.
   - Click **Save Changes**.
4. **Lock Overlay**: Press **`Ctrl + Shift + L`** (or click the lock icon in the header). The overlay becomes transparent and completely click-through.
5. **Unlock Overlay**: Press **`Ctrl + Shift + L`** again, or click the small **`🔓 Unlock`** button at the bottom of the overlay.
6. **Mute / Skip TTS**: Press **`Ctrl + Shift + K`** at any time to instantly silence TTS.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
