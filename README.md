# Money Mate - Bill Splitting Made Easy

Money Mate is a modern web application that helps you split bills with friends and family. It uses AI to automatically extract items and prices from receipt images, making the process of splitting expenses quick and hassle-free.

## Features

- 📸 Upload receipt images for automatic item extraction
- 🤖 AI-powered receipt analysis using Google's Gemini Pro Vision
- 👥 Add multiple people to split the bill with
- 🎯 Assign items to specific people
- 💰 Automatic calculation of individual shares
- 📊 Real-time bill summary
- 🎨 Modern, responsive design

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Google Gemini API key

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-mate.git
   cd money-mate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a receipt image by dragging and dropping or clicking the upload area
2. Wait for the AI to analyze the receipt and extract items
3. Add people to split the bill with using the "Add person" button
4. Assign items to people by clicking on their names
5. View the bill summary to see how much each person owes

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini Pro Vision API
- React Dropzone
- Headless UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
