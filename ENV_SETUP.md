
```env
MONGODB_URI=mongodb://localhost:27017/carido
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carido?retryWrites=true&w=majority
```

**Description:** Connection string for your MongoDB database. Replace with your actual MongoDB connection string.

---

### NextAuth Configuration

```env
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
```

**Description:**
- `NEXTAUTH_SECRET`: A random secret string used to encrypt JWT tokens. Generate one using:
  ```bash
  openssl rand -base64 32
  ```
  Or use an online generator: https://generate-secret.vercel.app/32

- `NEXTAUTH_URL`: The base URL of your application. Use `http://localhost:3000` for local development, or your production URL (e.g., `https://yourdomain.com`) for production.

---

### Cloudinary Configuration

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Description:** Cloudinary credentials for image uploads. Get these from your Cloudinary dashboard:
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

**Note:** For production, consider using environment-specific settings and restricting uploads by size/type.

---

## Example `.env.local` File

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/carido?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-key-minimum-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## Optional Environment Variables

### Razorpay (for future payment integration)

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

**Description:** Razorpay API keys for payment processing. Currently, the payment endpoint is a placeholder, but you can add Razorpay integration later.

---

## Security Notes

1. **Never commit `.env.local` to version control** - It's already in `.gitignore`
2. **Use different secrets for development and production**
3. **Rotate secrets regularly in production**
4. **Use environment variable management tools** (e.g., Vercel Environment Variables, AWS Secrets Manager) for production deployments

---

## Verification

After setting up your environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the console for any connection errors

3. Test the following:
   - User registration/login
   - Image uploads (Cloudinary)
   - Database operations (MongoDB)

---

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if MongoDB is running (for local instances)
- Ensure your IP is whitelisted (for MongoDB Atlas)

### NextAuth Issues
- Ensure `NEXTAUTH_SECRET` is at least 32 characters
- Verify `NEXTAUTH_URL` matches your application URL
- Clear browser cookies if experiencing authentication issues

### Cloudinary Upload Issues
- Verify all three Cloudinary variables are set correctly
- Check Cloudinary dashboard for upload limits/quota
- Ensure images are under the size limit (default: 10MB)

---

## Production Deployment

For production deployments (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Ensure `NEXTAUTH_URL` points to your production domain
3. Use production MongoDB and Cloudinary credentials
4. Enable HTTPS for secure connections

---

**Last Updated:** [Current Date]
**Version:** 1.0.0

