# Apify Integration Web App Challenge

This project is a full-stack web application built with React and Node.js that provides a clean interface for interacting with the Apify platform. It allows users to securely use their API token to list their actors, view dynamically generated input forms, execute runs, and see the results immediately.

## Key Features

-   **Secure Token Authentication**: The user's API token is handled securely on the backend and is never exposed in the browser.
-   **Dynamic Actor and Schema Loading**: Fetches and displays a user's actors and dynamically renders a unique input form for any selected actor at runtime.
-   **Synchronous Actor Execution**: Executes actor runs and waits for the result, providing immediate feedback to the user.
-   **Robust Error Propagation**: Catches and displays specific errors from the Apify API, whether it's an invalid token, a missing schema, or a failed actor run.
-   **Interactive UI/UX**: A responsive two-column layout with loading states and clear visual feedback to create an intuitive user experience.

---

## How to Install and Run

### Prerequisites

-   [Node.js and npm](https://nodejs.org/en/download) (LTS version)
-   An [Apify Account](https://apify.com/) and API Token

### Setup

1.  **Clone or download the project files.**

2.  **Install Backend Dependencies:**
    Open a terminal and navigate to the `backend` folder.
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    In another terminal, navigate to the `frontend` folder.
    ```bash
    cd frontend
    npm install
    ```

4.  **Run the Application:**
    You need two terminals running simultaneously.

    -   **Terminal 1 (Backend):**
        ```bash
        # From the apify-app/backend directory
        node index.js
        ```
        The backend server will start on `http://localhost:3001`.

    -   **Terminal 2 (Frontend):**
        ```bash
        # From the apify-app/frontend directory
        npm start
        ```
        The React application will open in your browser at `http://localhost:3000`.

---

## Working Flow and Screenshots

Here is a demonstration of the application's user flow.

**1. Authentication and Fetching Actors**
The user enters their Apify API token and clicks "Fetch Actors."
![alt text](<../backend/Screenshot 2025-07-29 163358.png>)
**2. Actor Selection**
A list of the user's actors appears in the left sidebar. The user selects an actor (e.g., `web-scraper`).
![alt text](<../backend/Screenshot 2025-07-29 163506.png>)

**3. Dynamic Form Rendering**
The application fetches the actor's input schema and dynamically renders a form in the main content area.

![alt text](<../backend/Screenshot 2025-07-29 163549.png>)

**4. Actor Execution and Results**
The user fills the form and clicks "Run Actor." After the run is complete, the results are displayed directly below the form.


**5. Error Handling**
The application correctly handles and displays specific errors, such as when running an actor that is designed to fail.
![alt text](<../backend/Screenshot 2025-07-29 164112.png>)

---

## Design and Implementation Choices

### Product Thinking
The application was designed with a clear, intuitive user flow that requires no external instructions. The **two-column layout** provides a persistent view of the actor list while allowing the user to interact with forms and results in a dedicated content area. State changes are clearly communicated through **loading spinners** and interactive UI elements (e.g., highlighted selections, disabled buttons).

### Technical Rigor
-   **Secure API Use:** The user's API token is sent with each request to the backend and is never stored in the frontend's state or local storage, preventing browser-side exposure.
-   **Dynamic Schema Handling:** The backend is designed to be robust. It handles multiple ways actors can define their schemas—either as a direct `inputSchema` object or within a version's `INPUT_SCHEMA.json` source file. This ensures compatibility with a wide range of actors.
-   **Proper Error Propagation:** The backend doesn't return generic error messages. It inspects the response from the Apify API and forwards the *specific* error message to the frontend, giving the user meaningful feedback.

### Creativity & UI/UX Enhancements
Beyond the bare minimum, several enhancements were made:
-   A responsive, modern two-column layout was implemented using CSS Grid.
-   Loading spinners and disabled buttons provide clear feedback during asynchronous operations.
-   The "selected" actor is highlighted, improving visual context.
-   The final run result is displayed in a formatted `<pre>` block for easy reading of JSON data.

### Actors Chosen for Testing
A variety of actors were used to ensure the application's robustness:
-   **`apify/hello-world`**: To test a successful run with a simple input schema.
-   **`apify/web-scraper`**: To test a complex schema with multiple input types.
-   **`apify/crawler-google-places`**: To test the robust schema-finding logic.
-   **`actor-fail-manager`**: A custom actor created to explicitly test the error propagation and ensure failure messages are displayed correctly.