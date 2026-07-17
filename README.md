# OmniFeed

A beautiful, lightweight, transparent, and lockable desktop overlay application that merges Twitch and Kick chat streams into a single feed. Designed for streamers who want to read their chat, follow events, subscriber milestones, custom channel point redemptions, and donation tips easily on a single monitor setup.

## Features

- **Lock & Click-Through (`Ctrl + Shift + L`)**:
  - **Unlocked Mode**: Window has borders, is draggable, resizable, and displays a settings button.
  - **Locked Mode**: Window borders disappear, the background goes transparent, and the overlay becomes **completely click-through**, allowing mouse clicks to pass directly to your game, stream, or desktop behind it.
- **Unified Chat Feed**: Merges Twitch and Kick chat messages in a unified list with platform-specific icons and custom SVG badges (Broadcaster, Moderator, VIP, Subscriber).
- **High Readability**: Message text is styled with a double-layered outline shadow to ensure 100% legibility over dark games, bright web pages, or videos.
- **Preset Style Themes**:
  - **Glassmorphism**: A sleek, modern frosted glass panel design with responsive glow boundaries.
  - **Minimalist**: A borderless, clean text-only floating HUD overlay.
  - **Retro Terminal**: A nostalgic pixel-art layout featuring scanlines, code boxes, and a custom terminal monospace font.
- **Live Viewers Count Display**:
  - Floating interactive widget showing real-time stream status.
  - Supports combined viewer totals, separate platform counts (purple for Twitch, green for Kick), or can be completely hidden.
- **Twitch Account Integration**:
  - Optional OAuth login flow that connects your Twitch account securely.
  - **Twitch Follow Alerts**: Real-time follow notification cards (`🟢 Username is now following on Twitch!`).
  - **Text-Free Channel Point Redemptions**: Captures custom point rewards (like sound effects, hydrate, etc.) and lists them directly by name: `🪙 Username redeemed: Reward Name`.
- **Twitch Custom Reward Highlights**: Highlights custom point rewards and highlighted message redeems with purple borders and badges (`🪙 Highlight Message` or `🪙 Custom Reward`).
- **Kick Webhook Event Alerts**: Captures follows, subscriber events, and gifted subscription alerts via Pusher.
- **StreamElements Tips Integration**:
  - Securely links with your StreamElements account token.
  - Displays real-time tip/donation event cards in emerald green: `💸 Username tipped $5.00: "message!"`.
- **Text-To-Speech (TTS) Engine**:
  - **Custom Modes**: Toggle off, enable for everyone, or restrict TTS to subscribers (which covers subs, VIPs, mods, and broadcaster).
  - **Trigger Modes**: Speak all messages, or only speak messages that start with `!tts` / `!TTS` (automatically cleaning the command prefix).
  - **Volume Adjuster**: Custom slider (0% to 100%) to fit your stream's audio mix.
  - **Donation Reader**: Automatically announces incoming StreamElements tips.
- **Chat Pause on Scroll**: Automatically pauses auto-scrolling when you scroll up to read past messages, resuming once you scroll back to the bottom.
- **Hide System Info Messages**: A toggle to silence administrative connection logs (like "Connected to Chat" and "Settings saved") so your screen remains clear when streaming.
- **Zero-Login Setup**: Reads public chat streams anonymously out of the box—no Twitch or Kick OAuth logins or accounts are required.
- **Auto-Resolve Kick Chatroom ID**: Includes a background resolver that fetches your Kick chatroom ID dynamically.
- **Custom Branding**: Fully branded packaging featuring glowing double speech-bubble app icons on built executables and taskbars.

---

## Preview

<img width="405" height="598" alt="image" src="https://github.com/user-attachments/assets/b068c233-d6b9-4f97-9167-f07873d65542" />
<img width="396" height="591" alt="image" src="https://github.com/user-attachments/assets/2b15d2a4-14e8-4d01-92cb-ab2effcc0d13" />
<img width="390" height="589" alt="image" src="https://github.com/user-attachments/assets/c7069743-db83-47ca-96fe-0dfdba4b8e41" />

---

## Installation

1. Go to the **Releases** section of this GitHub repository.
2. Download the latest **`StreamChatOverlay 3.0.0.exe`** file.
3. Run the `.exe` file directly (no installation or setup required!).

---

## How to Configure

1. When the app launches, it starts in **Unlocked Mode** by default.
2. **Move & Resize**: Drag the window using the top title bar and resize it by dragging the edges.
3. **Configure Settings**: Click the **Gear icon** in the top right to open the settings panel.
   - **Twitch Channel Name**: Enter your Twitch username.
   - **Twitch Account Connection**: Paste a developer Client ID from [dev.twitch.tv](https://dev.twitch.tv) (redirect URL set to `http://localhost:3000`) and click **Connect Twitch** to unlock follows and non-text reward tracking.
   - **Kick Channel Name**: Enter your Kick username.
   - **Kick Chatroom ID**: Click **Auto-Resolve** to automatically fetch your channel's unique ID.
   - **StreamElements Integration**: Paste your StreamElements JWT Token from [streamelements.com](https://streamelements.com) (under Account -> Channel Secrets) to unlock real-time donation alerts.
   - **Visuals & Sounds**: Select your theme, locked background opacity, font size, message fadeout timer, notification sounds, and TTS settings.
   - Click **Save Changes**.
4. **Lock Overlay**: Press **`Ctrl + Shift + L`** to lock the overlay. It will instantly go transparent and ignore all mouse interaction.
5. **Unlock Overlay**: Press **`Ctrl + Shift + L`** again to unlock and modify settings or reposition the window.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
