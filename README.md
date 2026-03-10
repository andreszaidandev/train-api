# 🚂 Train API (MBTA Real-time Viewer)

This repository hosts a modern, responsive web application designed to provide real-time information and status updates for the Massachusetts Bay Transportation Authority (MBTA) train lines. Built with React and TypeScript, this project offers a user-friendly interface to track various train lines, leveraging geolocation for enhanced user experience.
<img width="1920" height="1080" alt="Screenshot 2026-03-10 142633" src="https://github.com/user-attachments/assets/0ce978fc-263b-482e-a768-ea0f4b26cbfb" />

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![MBTA API](https://img.shields.io/badge/MBTA_API-Integration-blue?style=for-the-badge)

## Live Preview
[View the live app](https://train-api-beta.vercel.app)

## ✨ Features

*   **Real-time MBTA Data**: Integrates with the MBTA API to fetch and display up-to-date train line status and information.
*   **Interactive UI**: A clean and intuitive user interface built with React allows for easy navigation and viewing of different train lines.
*   **Geolocation Support**: Utilizes the browser's geolocation API to potentially provide location-aware information, such as nearby stations or relevant line updates.
*   **Line-specific Visuals**: Displays distinct visual cues (colors, icons) for each MBTA train line (Red, Orange, Blue, Green).
*   **Component-Based Architecture**: Developed with a modular React component structure for maintainability and scalability.

## 🚀 Getting Started

Follow these steps to set up and run the MBTA Real-time Viewer locally.

### Prerequisites

Ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://docs.npmjs.com/download/package-manager) (comes with Node.js) or [Yarn](https://classic.yarnpkg.com/en/docs/install/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/andreszaidandev/train-api.git
    cd train-api
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables (Optional, but Recommended)**:
    This application interacts with external APIs. You may need an MBTA API Key for full functionality, depending on the specific API endpoints being called.

    *   Create a `.env` file in the root of the project:
        ```bash
        touch .env
        ```
    *   Add your API key(s) to the `.env` file. For example:
        ```env
        VITE_MBTA_API_KEY=your_mbta_api_key_here
        ```
        (Please check `src/lib/mbta.ts` to confirm the exact environment variable names and if an API key is strictly required for the current implementation.)

### Running the Application

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will typically be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## 💡 Usage

Once the application is running:

1.  Open your web browser and navigate to the local server address.
2.  The application will display a top bar and various train line cards.
3.  If prompted, allow browser geolocation to enable location-based features.
4.  Interact with the displayed train line cards to view specific information or status updates.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React](https://react.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **API Integration**: [MBTA API](https://api-v3.mbta.com/)
*   **Code Quality**: [ESLint](https://eslint.org/)

## 🗺️ Roadmap

Future enhancements and features could include:

*   Detailed station information and arrival predictions.
*   User preferences for favorite lines/stations.
*   Notifications for service alerts or delays.
*   Improved error handling and loading states.
*   Mobile responsiveness optimizations.
*   Integration with other public transit data sources.

## 👋 Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests if applicable.

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) [Year] [Your Name or Project Maintainer]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
```
