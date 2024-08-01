# Chat Widget

This repository contains the code for a chat widget. Follow the instructions below to set up and run the project.

## Getting Started

### Prerequisites

- Node.js
- Yarn

### Installation

1. Clone the repository:

   ```sh
   git clone <repository_url>
   cd chat-widget
   ```

2. Install the dependencies:
   ```sh
   yarn install
   ```

### Running the Server

1. Navigate to the server directory:

   ```sh
   cd server
   ```

2. Start the server:
   ```sh
   yarn serve
   ```
3. Server directory has mock cert and key to run locally at https

   ```

   ```

### Building the Widget

1. Navigate back to the root directory:

   ```sh
   cd ..
   ```

2. Build the widget:

   ```sh
   yarn webpack
   ```

   This will generate a `bundle.js` file in the `dist` folder.

### Development

- The `src` folder contains the main widget code.
- Any time you change the code in the `src` folder, you need to manually run the webpack build to update `bundle.js`:
  ```sh
  yarn webpack
  ```

### Example

- The `site` directory in the root contains an example HTML page with the script that embeds the widget.
- The `index.html` file inside the `site` directory is served by the Node server in the `server` directory.
