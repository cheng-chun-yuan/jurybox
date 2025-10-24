# Privy Authentication Setup

## Overview
Privy is integrated for user authentication with support for email, wallet, Google, and Twitter login methods.

## Configuration

### 1. Environment Variable
Your Privy App ID is already configured in `.env`:
```
NEXT_PUBLIC_PRIVY_APP_ID=cmh4bs7xz000njm0ctqd26b42
```

### 2. Privy Dashboard Settings
Visit https://dashboard.privy.io/ to configure your app:

- **Allowed Domains**: Add `localhost:3000` and your production domain
- **Login Methods**: Email, Wallet, Google, Twitter (all enabled)
- **Embedded Wallets**: Enabled with "Create on login for users without wallets"
- **Theme**: Dark mode with purple accent color (#8B5CF6)

### 3. Usage

The `SignInButton` component is used across all pages:
- Landing page (`/`)
- Marketplace (`/marketplace`)
- Submit page (`/submit`)

**Features:**
- Shows "Sign In" when not authenticated
- Shows user email/wallet and "Sign Out" when authenticated
- Responsive design (hides text on mobile)
- Matches site theme with purple accent

### 4. Accessing User Data

```typescript
import { usePrivy } from '@privy-io/react-auth'

function MyComponent() {
  const { authenticated, user, login, logout } = usePrivy()

  if (authenticated && user) {
    console.log('User email:', user.email?.address)
    console.log('User wallet:', user.wallet?.address)
  }

  return <div>...</div>
}
```

## Files Created

1. `/components/providers/privy-provider.tsx` - Privy context provider
2. `/components/auth/sign-in-button.tsx` - Reusable sign-in component
3. `/app/layout.tsx` - Updated to wrap app with PrivyProvider

## Next Steps

- [ ] Add user profile page
- [ ] Integrate user data with agent registration
- [ ] Add wallet connection for blockchain interactions
- [ ] Implement role-based access control
