# Stream Chat Overlay

A beautiful, lightweight, transparent, and lockable desktop overlay application that merges Twitch and Kick chat streams into a single feed. It is designed for streamers who want to read their chat easily on a single monitor setup.

## Features

- **Lock & Click-Through (`Ctrl + Shift + L`)**:
  - **Unlocked**: Window has borders, is draggable, resizable, and displays a settings button.
  - **Locked**: Window borders disappear, the background goes transparent, and the overlay becomes **completely click-through** so clicks pass directly to your game, stream, or desktop behind it.
- **Unified Chat Feed**: Displays Twitch and Kick chat messages in a unified list with platform-specific icons and custom SVG badges (Broadcaster, Moderator, VIP, Subscriber).
- **High Readability**: Message text is styled with a double-layered outline shadow to ensure 100% legibility over dark games, bright web pages, or videos.
- **Customizable Visuals**:
  - **Background Opacity**: Set the opacity of the overlay background when locked (0% for complete transparency, or add a subtle dark background).
  - **Font Size**: Adjustable text size from 12px to 28px.
  - **Message Fadeout Timer**: Set messages to slowly fade out after a certain period of inactivity (e.g., 15 seconds) so your screen remains clear when chat is quiet.
- **Text-To-Speech (TTS)**:
  - **Custom Modes**: Toggle off, enable for everyone, or restrict TTS to subscribers (which covers subs, VIPs, mods, and broadcaster).
  - **Trigger Modes**: Speak all messages, or only speak messages that start with `!tts` / `!TTS` (automatically cleaning the command prefix).
  - **Volume Adjuster**: Custom slider (0% to 100%) to fit your stream's audio mix.
- **Zero-Login Setup**: Reads public chat streams anonymously—no Twitch or Kick OAuth logins or accounts are required.
- **Auto-Resolve Kick Chatroom ID**: Includes a background resolver that fetches your Kick chatroom ID dynamically.

## Preview

| Unlocked Mode (Draggable & Configurable) | Locked Mode (Transparent & Click-Through) |
| --- | --- |
| Window has a border, drag handle, and settings gear. | Window is completely transparent and mouse clicks pass right through. |

## Installation

1. Go to the **Releases** section of this GitHub repository.
2. Download the latest **`StreamChatOverlay.exe`** file.
3. Run the `.exe` file directly (no installation or setup required!).

## How to Configure

1. When the app launches, it starts in **Unlocked Mode** by default.
2. **Move & Resize**: Drag the window using the top title bar and resize it by dragging the edges.
3. **Configure Settings**: Click the **Gear icon** in the top right to open the settings panel.
   - Enter your **Twitch Channel Name**.
   - Enter your **Kick Channel Name**.
   - Click the **Auto-Resolve** button next to *Kick Chatroom ID* to automatically fetch your channel's unique ID.
   - Set your preferred locked background opacity, font size, and message fadeout timer.
   - Click **Save Changes**.
4. **Lock Overlay**: Press **`Ctrl + Shift + L`** to lock the overlay. It will instantly go transparent and ignore all mouse interaction.
5. **Unlock Overlay**: Press **`Ctrl + Shift + L`** again to unlock and modify settings or reposition the window.

## How it Works

- **Twitch IRC**: The app opens a native browser `WebSocket` connection to Twitch's public IRC server (`wss://irc-ws.chat.twitch.tv:443`) as an anonymous guest (`justinfanXXXXX`).
- **Kick Pusher**: The app resolves your Kick channel slug to a chatroom ID via a hidden background window. Once resolved, it connects directly to Kick's public Pusher WebSocket cluster (`wss://ws-us2.pusher.com`).
- **Persistence**: Configuration (channel names, window bounds, locked states, and visual preferences) is stored locally in a standard JSON config file in your system's app data directory.


---

<img width="381" height="587" alt="Screenshot 2026-06-30 033018" src="https://github.com/user-attachments/assets/ffc261f0-b1aa-4ba4-b5c1-b9c0282e1c50" />
<img width="401" height="600" alt="Screenshot 2026-06-30 033002" src="https://github.com/user-attachments/assets/925456c5-f506-432b-9848-1717ed23b1cd" />
