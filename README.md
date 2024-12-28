# Twitch Rivals Rust Overlay

## **Project Overview**
This project is a real-time stats display overlay designed for Twitch Rivals Rust events. It dynamically showcases player and team statistics in an engaging format, tailored to enhance the viewing experience on Twitch. The overlay is hosted during the event but can also be self-hosted for custom usage.

---

## **Features**

### **1. Player and Team Stats Display**
- **Single Player Mode:**
  - Displays detailed statistics of a player:
    - Team Name
    - Kills
    - Deaths
    - Kill/Death Ratio (KDR)
    - Accuracy (%)
    - Damage Done
  - Activated when a specific player is highlighted.

- **Team Mode:**
  - Displays scrolling cards for all members of the player's team:
    - Each card includes the team member's stats.
    - Smooth vertical scrolling animation.
  - Automatically switches to this mode after 10 seconds if no change in the highlighted player.

### **2. Twitch Commands**
- `!rank` - Displays the global ranking of teams based on points.
- `!teamrank {teamName}` - Shows the top 5 players in a specific team based on kills.
- `!stats {playerName}` - Retrieves detailed stats of a specific player.
- `!teams` - Lists all available teams.
- `!help` - Displays a list of commands and their descriptions.

### **3. OBS Integration**
- **Transparent Background:**
  - Ensures seamless integration as an overlay in OBS.
- **Customizable Design:**
  - Modify styles with CSS for a tailored appearance.

### **4. Hosting Options**
- The overlay is hosted during Twitch Rivals events.
- For custom usage, self-hosting is supported with detailed setup instructions.

---

## **Installation Guide**

### **Prerequisites**
- Node.js (v14+)
- MongoDB
- OBS Studio

### **Setup Instructions**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/twitch-rust-overlay.git
   cd twitch-rust-overlay
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   TWITCH_CLIENT_ID=<your-twitch-client-id>
   TWITCH_CLIENT_SECRET=<your-twitch-client-secret>
   API_BASE=https://rustoria.co/twitch/api
   FRONT_END_REDIRECTION=<your-frontend-url>
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Set up the frontend:
   - Navigate to the frontend directory.
   - Run `npm install`.
   - Start the frontend with `npm start`.

### **OBS Integration**
1. Open OBS Studio.
2. Add a **Browser Source**.
3. Set the URL to your frontend app (e.g., `http://localhost:3000` or your deployed URL).
4. Adjust the dimensions and layout as required.

---

## **How It Works**

### **Global Rankings (`!rank`)**
- Retrieves the global team rankings sorted by points.
- Displays the top 10 teams with their names and point totals.

### **Team Rankings (`!teamrank {teamName}`)**
- Fetches the stats for a specific team.
- Displays the top 5 players in the team sorted by kills.

### **Player Stats (`!stats {playerName}`)**
- Searches for a player across all teams.
- Displays detailed stats, including kills, deaths, KDR, accuracy, and more.

### **Team List (`!teams`)**
- Fetches and displays a list of all teams currently active.

### **Help Command (`!help`)**
- Provides a summary of all available commands and their usage.

---

For additional guidance or custom requirements, feel free to reach out!
