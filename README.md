# AI Expense Snap

AI Expense Snap is an intelligent expense tracking application that leverages AI to scan receipts and automatically extract expense information with persistent storage using Supabase.

## Features

- Image upload functionality with drag-and-drop support
- AI-powered extraction using Google's `gemini-2.5-flash` model (extracts total, currency, category, vendor name, and billing date)
- Manual expense entry form for adding expenses directly
- Expense tracking table to view all expenses with billing dates
- Responsive design that works on all device sizes
- Ability to delete and update expenses from the tracking table
- Dark mode support
- Supabase integration for persistent storage of expenses

## Tech Stack

- **Framework**: Next.js 16 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Services**: Google Generative AI (Gemini)
- **Database**: Supabase
- **UI Components**: Lucide React icons
- **Utilities**: Class Variance Authority, clsx, tailwind-merge

## Setup Instructions

1. **Clone the repository** (or create the project files as described)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the project root with:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Create the expenses table by copying the SQL from `supabase/supabase.txt` and running it in the Supabase SQL Editor
   - (Optional for production) Enable Row Level Security (RLS) and set up appropriate policies

5. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

## How to Use

1. **Upload a receipt image** using the drag-and-drop interface or file selector
2. **Click "Extract Expense Data"** to use AI to extract expense information
3. **View the extracted information** in the expenses table (automatically saved to Supabase)
4. **Add expenses manually** using the form if needed
5. **Edit or delete expenses** directly from the table (changes are saved to the database)
6. **All data persists** across sessions due to Supabase integration

## Project Structure

```
ai-expense-snap/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   └── process-image/  # Image processing endpoint
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── ui/                 # UI-specific components
│   │   └── theme-toggle.tsx # Theme toggle component
│   ├── UploadReceipt.tsx   # Image upload component
│   ├── ExpenseForm.tsx     # Manual expense entry form
│   └── ExpenseTable.tsx    # Expense tracking table
├── lib/                    # Utility functions
│   ├── geminiService.ts    # Google Gemini API integration
│   ├── imageUtils.ts       # Image processing utilities
│   ├── supabase.ts         # Supabase client configuration
│   ├── supabaseOperations.ts # Database operations for expenses
│   └── dateUtils.ts        # Date formatting utilities
├── types/                  # TypeScript type definitions
│   └── expense.ts          # Expense-related type definitions
├── supabase/               # Supabase-related files
│   ├── schema.sql          # Database schema for expenses table
│   └── supabase.txt        # Clean SQL for copying to Supabase editor
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

## Environment Variables

- `GOOGLE_API_KEY`: Your Google API key for accessing Gemini models (required)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (required for database functionality)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (required for database functionality)

## API Integration

The application uses Google's Gemini AI model to extract expense information from receipt images. The `extractExpenseData` function in `lib/geminiService.ts` handles the API communication and returns structured expense data.

## Supabase Integration

The application now integrates with Supabase for persistent storage. The main features include:

- Automatic loading of expenses from Supabase when the application starts
- New expenses (both AI-extracted and manually entered) are immediately saved to the database
- Updates and deletions are synchronized with the Supabase database
- The `lib/supabaseOperations.ts` file contains all the database operations for interacting with the expenses table

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.