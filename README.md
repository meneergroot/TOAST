# TOAST - Solana Social Media Platform

A fully responsive Twitter-like social media web app built with HTML, CSS, and JavaScript that integrates with the Solana blockchain.

## Features

- **Twitter-like UI**: Modern, responsive design with dark/light mode
- **Phantom Wallet Integration**: Connect and interact with Solana blockchain
- **Social Features**: Post tweets, like, retweet (280 character limit)
- **Blockchain Transactions**: Each action costs $0.01 USDC
- **Revenue Sharing**: 50% to developer, 50% to content creators
- **Mobile-First**: Fully responsive design for all devices
- **Real-time Updates**: Live feed with auto-refresh

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Blockchain**: Solana (Mainnet)
- **Wallet**: Phantom Wallet
- **Storage**: Local Storage (for demo)
- **Deployment**: Vercel-ready

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TOAST
   ```

2. **Start local server**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Or using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Testing the App

1. **Install Phantom Wallet**
   - Download from [phantom.app](https://phantom.app/)
   - Create a new wallet or import existing one

2. **Connect Wallet**
   - Click "Connect Phantom" button
   - Approve connection in Phantom wallet
   - Your wallet address and balance will display

3. **Post a Tweet**
   - Type your message (max 280 characters)
   - Click "Post ($0.01)" button
   - Approve transaction in Phantom wallet
   - Tweet will appear in feed

4. **Interact with Tweets**
   - Like tweets (costs $0.01)
   - Retweet tweets (costs $0.01)
   - Share tweets
   - View like/retweet counts

5. **Test Responsive Design**
   - Resize browser window
   - Test on mobile devices
   - Toggle dark/light mode

## Project Structure

```
TOAST/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Base styles and variables
│   ├── components.css     # Component-specific styles
│   └── responsive.css     # Responsive design rules
├── js/
│   ├── utils/
│   │   ├── constants.js   # App constants and config
│   │   ├── helpers.js     # Utility functions
│   │   └── storage.js     # Local storage management
│   ├── hooks/
│   │   ├── useWallet.js   # Wallet connection logic
│   │   └── useTransactions.js # Transaction handling
│   ├── components/
│   │   ├── Tweet.js       # Tweet component
│   │   └── Toast.js       # Notification system
│   ├── pages/
│   │   └── Feed.js        # Feed page logic
│   └── app.js             # Main app entry point
└── README.md
```

## Configuration

### Solana Network
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Devnet**: `https://api.devnet.solana.com` (for testing)

### Fee Structure
- **Post Tweet**: $0.01 USDC
- **Like Tweet**: $0.01 USDC
- **Retweet**: $0.01 USDC
- **Profile Picture**: $1.00 USDC

### Revenue Sharing
- **Developer Wallet**: `EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3` (50% of engagement fees, 100% of profile fees)
- **Content Creators**: Original poster receives 50% of all engagement fees
- **Profile Pictures**: 100% goes to developer wallet (prevents spam)

## Smart Contract Integration

The app is prepared for smart contract integration with Anchor framework. Key areas for implementation:

### Transaction Logic
- USDC token transfers
- Fee distribution
- Tweet storage on-chain
- Like/retweet state management

### Smart Contract Structure
```rust
// Anchor program structure (to be implemented)
pub mod toast {
    use super::*;
    
    pub fn post_tweet(ctx: Context<PostTweet>, content: String) -> Result<()> {
        // Transfer USDC fees (50% developer, 50% creator)
        // Store tweet data
        // Emit event
        Ok(())
    }
    
    pub fn like_tweet(ctx: Context<LikeTweet>) -> Result<()> {
        // Transfer USDC fees (50% developer, 50% original poster)
        // Update like state
        // Emit event
        Ok(())
    }
    
    pub fn retweet(ctx: Context<Retweet>) -> Result<()> {
        // Transfer USDC fees (50% developer, 50% original poster)
        // Update retweet state
        // Emit event
        Ok(())
    }
    
    pub fn update_profile_picture(ctx: Context<UpdateProfilePicture>) -> Result<()> {
        // Transfer USDC fees (100% to developer wallet)
        // Update profile picture
        // Emit event
        Ok(())
    }
}
```

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial TOAST app"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Deploy automatically on push
   - Custom domain setup (optional)

### Environment Variables
```env
# For production deployment
SOLANA_NETWORK=mainnet-beta
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
DEVELOPER_WALLET=EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3
```

## Testing Checklist

- [ ] Wallet connection works
- [ ] Dark/light mode toggle
- [ ] Tweet posting (character limit, validation)
- [ ] Like/retweet functionality
- [ ] Responsive design on mobile
- [ ] Toast notifications
- [ ] Transaction simulation
- [ ] Feed refresh
- [ ] Sample data loading

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review browser console for errors

## Roadmap

- [ ] Smart contract integration
- [ ] Real-time updates
- [ ] User profiles
- [ ] Image uploads
- [ ] Advanced search
- [ ] Trending topics
- [ ] Notifications
- [ ] Direct messages