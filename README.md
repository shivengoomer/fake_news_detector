# fake_news_detector

A Node.js-based bot for detecting and managing fake news, with plugin support and integration for various APIs.

## Features

- Detects fake news 
- Modular plugin system for group management and automation
- Configurable via environment variables
- Supports group tagging, scheduling, and more

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/fake_news_detector.git
    cd fake_news_detector
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following keys:
    ```env
    AUTH_FOLDER=auth
    SELF_REPLY=false
    LOG_MESSAGES=true
    GENAI_KEY=your_genai_key_here
    AZURE_CONNECTION_STRING=your_azure_connection_string_here
    ```

4. (Optional) Place authentication files in the `auth/` folder.

### Usage

Start the bot with:

```sh
node index.js
```

## Configuration

- Edit `config.js` to customize bot and plugin settings.
- Environment variables are loaded from `.env`.

## License

MIT

---
*Replace API keys and sensitive information in `.env` before running the bot.*