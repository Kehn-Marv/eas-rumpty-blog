# I Built EAS on RumptyCloud — Editorial Publication

A sleek, modern editorial web publication documenting the real-world architecture, deployment challenges, and engineering lessons learned from building and deploying the **Educational Agentic System (EAS)** on **RumptyCloud**.

---

## 📖 Overview

**"I Built EAS on RumptyCloud. Here's What Actually Happened."** is a long-form technical article crafted for deep readability, aesthetic typography, and interactive technical documentation. It provides an honest retrospective covering what worked, what failed, and key architectural takeaways.

---

## ✨ Features

- **Editorial-Grade Typography & Design**: Built with tailored typography using **Outfit**, **Inter**, and **JetBrains Mono**, featuring refined dark-mode aesthetics.
- **Dynamic Table of Contents (ToC)**:
  - Automatically indexes headings across the article.
  - Active section highlight as you scroll.
  - Collapsible desktop sidebar and responsive mobile drawer.
- **Reading Progress Bar & Estimator**:
  - Top-pinned reading progress indicator.
  - Dynamic estimated reading time calculator.
- **Code & Architecture Callouts**:
  - Syntax-highlighted code snippets and terminal outputs.
  - Dedicated callout cards, stat metrics, and architectural breakdown containers.
- **Zero Heavy Frontend Frameworks**: Pure vanilla HTML5, CSS3, and JavaScript for instant load times and high performance.

---

## 🛠️ Tech Stack

- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Frontend**: Semantic HTML5, Vanilla CSS3, Modern JavaScript (ES6+)
- **Typography**: [Google Fonts](https://fonts.google.com/) (Outfit, Inter, JetBrains Mono)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eas-rumpty-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server with automatic file watching:
```bash
npm run dev
```

To run in standard production mode:
```bash
npm start
```

Open your browser at:
```
http://localhost:3000
```

---

## 📁 Project Structure

```text
eas-rumpty-blog/
├── public/
│   ├── css/
│   │   └── article.css      # Editorial styles, responsive layout & custom variables
│   ├── js/
│   │   └── article.js       # ToC generator, reading progress & UI interactions
│   └── index.html           # Full article publication content & markup
├── .gitignore               # Ignored dependencies, environment files & agent folders
├── package.json             # Project dependencies and npm scripts
├── README.md                # Project documentation
└── server.js                # Express static web server
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
