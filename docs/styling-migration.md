# Styling Migration Guide: Next.js v13 to v15

This document outlines the steps required to migrate the styling from the Next.js v13 project to the new Next.js v15 project, ensuring visual consistency for the components listed in `migration.md`.

## 1. Tailwind CSS Configuration

The core of the styling is managed by Tailwind CSS.

**Action:**

1.  Copy the `tailwind.config.js` file from the root of the v13 project to the root of the v15 project.
2.  Ensure the `content` paths in `tailwind.config.js` are updated to match the directory structure of the v15 project (e.g., if you are using the `src` directory, update the paths accordingly).

**Key configurations in `tailwind.config.js`:**

- **Custom Fonts:** `Space Grotesk` and `Barlow Semi Condensed`.
- **Custom Colors:** A specific color palette for `blue` and `btc`.
- **Plugins:** `@tailwindcss/forms` and `@tailwindcss/typography`.

## 2. Global Styles

Global styles, including Tailwind's base styles, custom utility classes, and font definitions, are imported into the application.

**Action:**

1.  Copy the following files and directories from the v13 project to the v15 project:
    - `css/`
    - `styles/`
    - `public/fonts/`
2.  In the v15 project's root layout (`app/layout.tsx` or similar), import the global CSS files. The order of imports is important.

    ```tsx
    // app/layout.tsx
    import '@/css/tailwind.css'
    import '@/css/prism.css'
    import 'katex/dist/katex.css'
    import 'styles/globals.css'

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode
    }) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      )
    }
    ```

**Key files and their roles:**

- `css/tailwind.css`: Contains Tailwind directives and custom `@layer` styles.
- `styles/globals.css`: Contains `@font-face` declarations, custom button styles, and animations.
- `css/prism.css`: Syntax highlighting styles.
- `public/fonts/`: Contains the font files for `Space Grotesk` and `Barlow Semi Condensed`.

## 3. Layout and Component Structure

In the v13 project, `pages/_app.tsx` uses a `LayoutWrapper` component to provide a consistent layout across pages.

**Action:**

1.  Copy the `components/LayoutWrapper.tsx` component from the v13 project to the v15 project.
2.  In the v15 project's root layout (`app/layout.tsx`), use the `LayoutWrapper` to wrap the `{children}`.

    ```tsx
    // app/layout.tsx
    import LayoutWrapper from '@/components/LayoutWrapper'
    // ... other imports

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode
    }) {
      return (
        <html lang="en">
          <body>
            <LayoutWrapper>{children}</LayoutWrapper>
          </body>
        </html>
      )
    }
    ```

## 4. Component-Specific Styles

Many components use Tailwind CSS utility classes directly in their JSX.

**Action:**

- When migrating components, ensure that the class names are copied over correctly.
- Pay close attention to any custom classes defined in the global CSS files (e.g., `button.pay`, `button.twitter`).

## 5. Dependencies

Ensure that the necessary dependencies are installed in the v15 project.

**Action:**

- Compare the `package.json` files of the two projects and install any missing styling-related dependencies in the v15 project. Key dependencies include:
  - `tailwindcss`
  - `postcss`
  - `autoprefixer`
  - `@tailwindcss/forms`
  - `@tailwindcss/typography`

By following these steps, you should be able to replicate the styling of the v13 project in the new v15 project.
