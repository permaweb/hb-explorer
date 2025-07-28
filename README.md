# HyperBEAM Explorer

HyperBEAM Explorer provides an interface for monitoring, exploring, and interacting with [HyperBEAM](https://github.com/permaweb/HyperBEAM) nodes.

## Getting Started

### Prerequisites

- Node.js (18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/permaweb/hb-explorer
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
```

## Development

### Available Scripts

- `npm run start:development` - Start development server
- `npm run build` - Create production build
- `npm run format` - Format code with ESLint and Prettier

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

## Support

For issues and questions:

- Check the [HyperBEAM documentation](https://hyperbeam.arweave.net/)
- Open an issue in this repository
- Join the Arweave/AO community discussions
