# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/28398ec0-7f4d-46cb-9595-26d0012d7d29

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/28398ec0-7f4d-46cb-9595-26d0012d7d29) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/28398ec0-7f4d-46cb-9595-26d0012d7d29) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Local development: demo videos

If you don't have a YouTube Data API key configured for the Supabase Edge Function `fetch-youtube-videos`, you can use the built-in demo videos while developing locally.

- Create a local `.env` file (or set the environment variable) with:

```
VITE_USE_MOCK_VIDEOS=true
```

- Restart the dev server after changing env variables. When enabled, the Videos page will show demo videos and skip calling the remote function.

For production, make sure your Supabase Edge Function has `YOUTUBE_API_KEY` configured in the function environment.

## GROQ AI integration

The AI chat is ready to call a GROQ AI endpoint to receive real responses. To enable it, add the following to your `.env` or hosting environment:

```
VITE_GROQ_API_URL=https://your-groq-endpoint.example/api/chat
VITE_GROQ_API_KEY=optional_api_key_if_required
```

When configured, the chat UI will POST messages to the URL with a JSON body containing `messages`. The UI will try to extract a `reply` or `message` field from the response, and also supports common shapes like OpenAI `choices` or `outputs`. If the GROQ endpoint returns a different schema, paste an example response and I will adapt the parser.

If you don't set these variables, the UI will show a friendly message telling you to configure the GROQ endpoint.
