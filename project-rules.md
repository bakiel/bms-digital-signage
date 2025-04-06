# BMS Digital Signage - Project Rules

## ⚙️ Global Rules For AI Assistants

### 🔄 Project Awareness & Context
- **Always read `planning-revised.md`** at the start of a new conversation to understand the project's architecture, goals, and constraints.
- **Check `tasks-revised-updated.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Understand Botswana-specific context** from `botswana-context.md` when implementing features related to currency, schools, or localization.
- **Follow Mi TV Stick implementation guidelines** in `mi-tv-setup.md` for display optimization.
- **Use consistent naming conventions and architecture patterns** as described in our planning documents.

### 🌐 Web-Based Implementation Focus
- **Build as a web application** optimized for browser display on Mi TV Stick devices.
- **No native app development** - focus exclusively on browser-based implementation.
- **Optimize for TV display** using the techniques described in `mi-tv-setup.md`.
- **Ensure compatibility** with Mi TV Stick browser capabilities.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into components or helper files.
- **Organize React components** into logical folders (layout, slides, admin, animations, etc.).
- **Use Supabase for all data operations** following patterns in `sample-code-snippets.md`.
- **Follow component-based architecture** with clear separation of concerns.

### 📦 Image Asset Management
- **Source images** are located in the `/images` folder.
- **Upload images to Supabase Storage** using the process outlined in `image-management.md`. Use appropriate buckets (`branding`, `products`, `uniforms`, `ui-elements`).
- **Reference images in the application** using the Supabase path format (`bucket/formatted-filename.ext`), typically stored in the database `image_url` field. Use `image-link-reference.md` for verification.
- **Implement proper image optimization** for TV display (ensure uploaded images are reasonably sized).

### 💰 Currency & Localization
- **Format all prices in Botswana Pula (BWP)** as specified in `botswana-context.md`.
- **Show discounts with both original and sale prices** when applicable.
- **Use size-based pricing for uniform items** where appropriate.
- **Follow Botswana-specific seasonal considerations** for promotions and featured items.

### 🎨 Style & Conventions
- **Use React with TypeScript** as the primary framework.
- **Implement TailwindCSS** for styling components.
- **Use Framer Motion** for animations and transitions.
- **Follow ESLint and Prettier configurations** for consistent code style.
- **Create responsive layouts** that work well on TV displays.
- **Use FontAwesome icons** for consistent visual elements.

### 🧪 Testing & Reliability
- **Test on actual Mi TV Stick hardware** or appropriate emulation.
- **Verify animations and transitions** perform well on target hardware.
- **Implement error boundaries** to prevent display crashes.
- **Include fallback content** for network issues or missing data.
- **Test with realistic product quantities** to ensure performance with large catalogs.

### ✅ Task Completion
- **Mark completed tasks in `tasks-revised-updated.md`** by checking their checkboxes.
- **Add new sub-tasks** discovered during development.
- **Document any Mi TV Stick specific considerations** encountered during implementation.

### 📝 Documentation & Explainability
- **Update `readme.md`** (or `README-updated.md`) when new features are added or implementation details change.
- **Comment non-obvious code** and ensure everything is understandable.
- **Document any TV-specific optimizations** for future reference.
- **Include setup instructions** for store staff to configure Mi TV Stick devices.

### 🔒 Security & Access Control
- **Implement hidden admin controls** that appear only on cursor movement.
- **Require authentication** for admin access.
- **Store sensitive information** in environment variables.
- **Implement IP restrictions** for admin access if possible.
- **Create audit logging** for administrative actions.

### 🧠 AI Assistant Behavior Rules
- **Use available tools** (filesystem access, command execution, search, etc.) effectively.
- **Reference the 15 sample projects** when solving similar problems.
- **Never assume missing context** - ask questions using the `ask_followup_question` tool if uncertain.
- **Confirm file paths** exist before referencing them in code.
- **Never delete or overwrite existing code** unless explicitly instructed.
- **Focus on web implementation** - do not suggest native app approaches.

### 🏪 Store Environment Considerations
- **Design for viewing distance** of 3-5 meters in retail environments.
- **Create highly visible price displays** for shoppers to see from aisles.
- **Consider ambient lighting** of typical BMS store locations.
- **Optimize information density** for quick comprehension by shoppers.
- **Include attention-grabbing elements** for specials and promotions.
