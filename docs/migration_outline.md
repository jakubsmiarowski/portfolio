# Portfolio Migration Outline

This document outlines the plan for creating a new portfolio application to replace the existing one.

## 1. Technology Stack

- **Framework:** TanStack Start (React)
  - Full-stack React framework.
- **Styling:** Tailwind CSS
  - Utility-first CSS framework.
- **UI Library:** shadcn/ui & Lucide React (Icons)
  - Accessible, customizable components.
- **Animation:** Framer Motion
  - For layout transitions and micro-interactions.
- **Forms:** React Hook Form
- **Backend & Database:** Convex
  - Real-time database and backend functions.
- **Authentication:** Google OAuth (via Convex)
  - Strictly for the Admin user (owner).

## 2. Requirements & Features

### Public View (Portfolio)

- **Design:** Modern, clean, responsive. Use Tailwind and Framer Motion for a polished feel.
- **Content:**
  - **Home/Hero:** Intro text, bio, link to resume.
  - **About:** Display the "facts" list (or a more narrative version).
  - **Projects:** clear display of projects with images, links (Live/Code), and descriptions.
    - _Must fetch project data from Convex._
  - **Contact:**
    - Display email and social links.
    - **Contact Form:** Fields for Name, Email, Message.
    - **Action:** Submission saves the message to the Convex database. No email sending service required.

### Admin View (Dashboard)

- **Access:** Protected route. Only accessible by the owner (authenticated via Google OAuth).
  - _Implementation Note:_ Hardcode the allowed email (e.g., `smiarowski.jakub@gmail.com`) in the Convex auth policy or a robust allowlist.
- **Features:**
  1.  **Messages Inbox:** View messages submitted via the contact form.
  2.  **Project Management:**
      - Add new projects.
      - Edit existing projects.
      - Fields: Title, Description, Image URL, Live Link, Code Link, Tags/Tech Stack.
  - **Goal:** "The new code should be shareable and reusable. ... I should be able to add new projects that I worked on easily."

## 3. Data Model (Convex Schema Schema)

- **`messages` table:**
  - `senderName`: string
  - `senderEmail`: string
  - `content`: string
  - `createdAt`: number (timestamp)
  - `read`: boolean (optional, for inbox status)
- **`projects` table:**
  - `title`: string
  - `description`: string (or rich text)
  - `imageUrl`: string (storage ID or URL)
  - `liveLink`: string (optional)
  - `codeLink`: string (optional)
  - `tags`: array of strings
  - `order`: number (for display sorting)

## 4. Implementation Steps for the Agent

1.  **Initialization:**
    - Initialize a new TanStack Start project.
    - Configure Tailwind CSS and shadcn/ui.
    - Set up Convex (`npx convex dev`).

2.  **Backend Setup (Convex):**
    - Define the schema (`schema.ts`) for `messages` and `projects`.
    - Create query/mutation functions:
      - `api.messages.send`: Public mutation.
      - `api.messages.list`: Internal query (auth required).
      - `api.projects.list`: Public query.
      - `api.projects.create`/`update`: Internal mutation (auth required).
    - Configure Google Auth integration in Convex.

3.  **Frontend - Public:**
    - Create layout with Navbar/Footer.
    - Implement `HomePage`, `AboutSection`, `ProjectsSection`.
    - Fetching projects from Convex `api.projects.list`.
    - Implement `ContactForm` using React Hook Form + `api.messages.send`.

4.  **Frontend - Admin:**
    - Create `/admin` route (protected layout).
    - Implement Login page (if not authenticated).
    - **Dashboard:** List messages.
    - **Project Editor:** Form to add/edit projects (saving to Convex).

5.  **Migration:**
    - Create a seed script or manual entry form to populate the DB with the existing projects (from `docs/overview.md`).

6.  **Assets:**
    - Migrate images/resume to `public` folder or Convex storage.

## 5. Notes

- Ensure the code is modular and components are reusable.
- Use Framer Motion for page transitions or scroll reveals (replacing the old GSAP code).
