# 🚀 Deployment Guide for Netlify

## 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub/GitLab Repository** - Your code should be in a Git repository
3. **API Keys** - You'll need the following API keys

## 🔑 Required API Keys

### 1. Alchemy API Keys
Get your API keys from [Alchemy](https://www.alchemy.com/):
- Go to https://www.alchemy.com/
- Create a new app for ApeChain (Chain ID: 33139)
- Copy your API key

### 2. WalletConnect Project ID
Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/):
- Go to https://cloud.walletconnect.com/
- Create a new project
- Copy your Project ID

## 🚀 Deployment Steps

### Method 1: Deploy from Git (Recommended)

1. **Connect to Git Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose your Git provider (GitHub/GitLab)
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Set Environment Variables**
   In Netlify dashboard, go to Site settings → Environment variables and add:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_CHAIN_ID=33139
   NEXT_PUBLIC_ALCHEMY_API_KEY_1=your_alchemy_key_1
   NEXT_PUBLIC_ALCHEMY_API_KEY_2=your_alchemy_key_2
   NEXT_PUBLIC_ALCHEMY_API_KEY_3=your_alchemy_key_3
   NEXT_PUBLIC_ALCHEMY_API_KEY_4=your_alchemy_key_4
   NEXT_PUBLIC_ALCHEMY_API_KEY_5=your_alchemy_key_5
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_SECURITY_ENABLED=true
   NEXT_PUBLIC_RATE_LIMIT_ENABLED=true
   NEXT_PUBLIC_CSRF_ENABLED=true
   NEXT_PUBLIC_DEBUG_SECURITY=false
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Method 2: Manual Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag and drop your `.next` folder
   - Set environment variables as above

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)
- Go to Site settings → Domain management
- Add your custom domain
- Configure DNS settings

### 2. SSL Certificate
- Netlify automatically provides SSL certificates
- No additional configuration needed

### 3. Security Headers
- Already configured in `netlify.toml`
- Includes CSP, XSS protection, HSTS, etc.

## 🧪 Testing Your Deployment

1. **Check Homepage** - Should load without errors
2. **Test Wallet Connection** - Connect MetaMask or WalletConnect
3. **Test NFT Loading** - Check if NFTs load from Alchemy
4. **Test Game Functions** - Ping, Breed, Burn, Claim
5. **Check Security** - Verify security headers are present

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (should be 18)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_`
   - Redeploy after adding variables
   - Check browser console for errors

3. **Wallet Connection Issues**
   - Verify WalletConnect Project ID is correct
   - Check if domain is whitelisted in WalletConnect
   - Test with different wallets

4. **NFT Loading Issues**
   - Verify Alchemy API keys are correct
   - Check network connectivity to ApeChain
   - Verify contract addresses are correct

## 📊 Monitoring

### Netlify Analytics
- View site analytics in Netlify dashboard
- Monitor performance and errors

### Security Monitoring
- Check security headers are working
- Monitor for CSP violations
- Review rate limiting logs

## 🔄 Updates

To update your site:
1. Push changes to your Git repository
2. Netlify will automatically rebuild and deploy
3. Or trigger manual deploy from dashboard

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Test locally before deploying

---

**🎉 Your CrazyCube NFT Game is now live on Netlify!** 