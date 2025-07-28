# HyperBEAM Explorer

A web-based explorer interface for [HyperBEAM](https://github.com/permaweb/HyperBEAM)

## Overview

HyperBEAM Explorer provides a comprehensive dashboard and interface for monitoring, exploring, and interacting with HyperBEAM nodes. HyperBEAM is an Erlang-based implementation of AO-Core that enables flexible, distributed computing through a "decentralized operating system" model.

## Getting Started

### Prerequisites

- Node.js (18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hb-explorer

# Install dependencies
npm install

# Start development server
npm run start:development
```

### Build for Production

```bash
# Create production build
npm run build

# Deploy to Permaweb (requires configuration)
npm run deploy:main
```

## Development

### Available Scripts

- `npm run start:development` - Start development server
- `npm run build` - Create production build
- `npm run format` - Format code with ESLint and Prettier
- `npm run test` - Run tests
- `npm run deploy:main` - Deploy to main environment
- `npm run deploy:staging` - Deploy to staging environment

### Project Structure

```
src/
├── app/              # Main application setup
├── components/       # Reusable UI components
│   ├── atoms/       # Basic UI elements
│   ├── molecules/   # Component combinations
│   └── organisms/   # Complex components
├── views/           # Page-level components
│   ├── Landing/     # Dashboard and metrics
│   ├── Explorer/    # Process exploration
│   ├── Nodes/       # Node management
│   └── Console/     # Interactive console
├── helpers/         # Utilities and configurations
├── providers/       # React context providers
└── store/           # Redux store configuration
```

## Configuration

The application connects to HyperBEAM nodes and can be configured for different environments:

- **Development**: Connects to `https://forward.computer`
- **Production**: Uses the current origin

Environment-specific settings can be configured through the settings provider and local storage.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Related Projects

- [HyperBEAM](https://github.com/permaweb/HyperBEAM) - The core computational protocol
- [AO](https://ao.arweave.dev/) - Actor-oriented compute protocol
- [Arweave](https://arweave.org/) - Permanent data storage network

## Support

For issues and questions:

- Check the [HyperBEAM documentation](https://github.com/permaweb/HyperBEAM)
- Open an issue in this repository
- Join the Arweave/AO community discussions
