# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run start:development` - Start development server on port 3001
- `npm run format` - Run ESLint fix and Prettier formatting

### Build

- `npm run build` - Create production build in `/dist`

### Clean Install

- `npm run clean:install` - Remove node_modules, clear cache, and reinstall dependencies

## Architecture Overview

This is a React-based Single Page Application for exploring and interacting with HyperBEAM nodes. The architecture follows an atomic design pattern with clear separation of concerns.

### Core Technologies

- **React 18** with TypeScript for UI
- **Vite** as build tool with single-file output
- **Styled Components** for styling
- **React Router** for navigation
- **Redux** with persistence for state management
- **Monaco Editor** for code editing features
- **Arweave/AO libraries** for blockchain interaction

### Project Structure

**`/src/components/`** - UI components following atomic design:

- `atoms/` - Basic building blocks (Button, Input, Modal)
- `molecules/` - Composite components (Editor, JSONReader, MessageList)
- `organisms/` - Complex features (HyperPath, TransactionTabs, ProcessEditor)

**`/src/views/`** - Page-level components mapped to routes:

- `Landing/` - Dashboard with metrics and device information
- `Explorer/` - HyperBEAM path explorer interface
- `Nodes/` - Node management interface
- `Console/` - Interactive console for process interaction

**`/src/providers/`** - React Context providers:

- `SettingsProvider` - Theme, sidebar state, window size management
- `LanguageProvider` - Internationalization support
- `ArweaveProvider` - Wallet connection and blockchain interaction
- `PermawebProvider` - HyperBEAM connection management

**`/src/helpers/`** - Utility functions and configuration:

- `config.ts` - Central configuration (URLs, storage keys, asset endpoints)
- `endpoints.ts` - API endpoint management
- `themes.ts` - Theme definitions for light/dark modes
- `signatures.ts` - HTTP signature verification utilities

### Key Architectural Patterns

1. **Path Aliases**: Vite configured with absolute imports via aliases (e.g., `components/`, `helpers/`)

2. **Lazy Loading**: Views are dynamically imported using Vite's glob imports for code splitting

3. **HyperBEAM Integration**:

   - Global `window.hyperbeamUrl` for endpoint configuration
   - Path-based routing for exploring HyperBEAM resources
   - HTTP signature verification for authenticated responses

4. **State Management**:

   - Local storage for settings persistence
   - Redux for complex state (posts, transactions)
   - React Context for global UI state

5. **Asset Management**:

   - All assets served from Arweave transaction IDs
   - Helper function `getTxEndpoint()` for consistent URL generation

6. **Build Output**:
   - Single HTML file output with inlined assets
   - Node polyfills for browser compatibility
   - All code bundled into single ES module

### Environment-Specific Configuration

- **Development**: Connects to `https://forward.computer`
- **Production**: Uses current origin as HyperBEAM endpoint
- Settings stored in localStorage with key `settings`

### Component Communication Flow

1. Views receive route parameters and manage page-level state
2. Organisms handle complex business logic and API calls
3. Molecules provide reusable UI patterns
4. Atoms ensure consistent styling and behavior
5. Providers manage global application state
6. Helpers contain pure utility functions

The application is designed to be embedded as a single file in HyperBEAM nodes while maintaining full SPA functionality.
