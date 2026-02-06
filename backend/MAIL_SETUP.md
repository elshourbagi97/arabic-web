# Email Configuration Guide for Arabic Website

## Overview
This Laravel application uses SendGrid SMTP for sending password reset emails. This guide will help you configure the email system correctly.

## Prerequisites
1. SendGrid account (https://sendgrid.com/)
2. SendGrid API Key with Mail Send permissions
3. Verified sender email address in SendGrid

## Configuration Steps

### 1. Get SendGrid API Key
1. Log in to your SendGrid account
2. Navigate to **Settings → API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Arabic Website Laravel")
5. Select **Full Access** or at minimum **Mail Send** permissions
6. Copy the generated API key (you won't be able to see it again!)

### 2. Verify Sender Email
1. In SendGrid, go to **Settings → Sender Authentication**
2. Either:
   - **Domain Authentication** (recommended for production)
   - **Single Sender Verification** (quick setup for testing)
3. Verify your sender email address

### 3. Configure Environment Variables
Edit your `.env` file in the `backend` directory:

```env
# Mail Configuration (SendGrid SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=YOUR_SENDGRID_API_KEY_HERE
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- `MAIL_USERNAME` is always `apikey` (literal string, not your actual username)
- `MAIL_PASSWORD` is your SendGrid API key (starts with `SG.`)
- `MAIL_FROM_ADDRESS` must be a verified sender in SendGrid
- `MAIL_PORT=587` with `MAIL_ENCRYPTION=tls` is recommended
- Alternative: `MAIL_PORT=465` with `MAIL_ENCRYPTION=ssl`

### 4. Clear Configuration Cache
After updating `.env`, run:

```bash
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

### 5. Test Email Configuration

#### Method 1: Using Artisan Command
```bash
php artisan email:test your-email@example.com
```

This will:
- Display current mail configuration
- Send a test password reset email
- Show success/failure status

#### Method 2: Using the API Endpoint
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Troubleshooting

### Common Issues

#### 1. "Connection refused" Error
**Cause:** Cannot connect to SMTP server
**Solution:**
- Check `MAIL_HOST` is `smtp.sendgrid.net`
- Check `MAIL_PORT` is `587` or `465`
- Verify firewall allows outbound connections on SMTP ports

#### 2. "Authentication failed" Error
**Cause:** Invalid API key or username
**Solution:**
- Verify `MAIL_USERNAME=apikey` (exactly as written)
- Verify `MAIL_PASSWORD` is correct SendGrid API key
- Generate a new API key if needed

#### 3. "Sender address rejected" Error
**Cause:** Sender email not verified in SendGrid
**Solution:**
- Go to SendGrid Sender Authentication
- Verify the email address in `MAIL_FROM_ADDRESS`

#### 4. Emails Not Arriving
**Check:**
1. SendGrid Dashboard → Activity Feed
2. Check spam/junk folder
3. Verify recipient email is valid
4. Check SendGrid account is not suspended

### Debug Mode

To test without SendGrid (logs emails to file):
```env
MAIL_MAILER=log
```
Emails will be logged to `storage/logs/laravel.log`

### Check Logs
```bash
# View recent Laravel logs
tail -100 storage/logs/laravel.log

# Follow logs in real-time
tail -f storage/logs/laravel.log
```

## SendGrid Best Practices

1. **Use Domain Authentication** for better deliverability
2. **Monitor Your Reputation** in SendGrid dashboard
3. **Set Up Email Templates** (optional) for consistent branding
4. **Enable Event Webhooks** to track bounces and opens
5. **Respect Rate Limits** (check your SendGrid plan)

## Production Checklist

- [ ] SendGrid API key configured
- [ ] Sender email verified in SendGrid
- [ ] Domain authentication set up (recommended)
- [ ] MAIL_MAILER=smtp (not 'log')
- [ ] FRONTEND_URL set to production URL
- [ ] Test password reset flow
- [ ] Monitor SendGrid activity feed
- [ ] Set up alerts for delivery failures

## Additional Resources

- [SendGrid SMTP Documentation](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Laravel Mail Documentation](https://laravel.com/docs/11.x/mail)
- [SendGrid Best Practices](https://docs.sendgrid.com/ui/sending-email/email-best-practices)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `storage/logs/laravel.log`
3. Check SendGrid Activity Feed for delivery status
4. Verify all environment variables are set correctly
