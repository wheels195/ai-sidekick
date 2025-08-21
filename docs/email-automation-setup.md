# Email Automation Setup

## 📧 Trial Email Sequence

The 7-day trial email sequence is now fully implemented and ready to run automatically.

### How It Works:

1. **Welcome Email**: Sent immediately when user completes signup
2. **Trial Day 1-7**: Sent automatically based on days since signup
   - Day 1: 24 hours after signup
   - Day 2: 48 hours after signup  
   - Day 3: 72 hours after signup
   - Day 4: 96 hours after signup
   - Day 5: 120 hours after signup
   - Day 6: 144 hours after signup
   - Day 7: 168 hours after signup

### Automation Endpoint:

**POST** `/api/emails/process-trial`

This endpoint:
- Checks all users who signed up in the last 8 days
- Calculates days since signup
- Sends appropriate trial email if not already sent
- Logs sent emails to prevent duplicates

### Setting Up Automation:

#### Option 1: Vercel Cron (Recommended)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/emails/process-trial",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Option 2: External Cron Service
- **EasyCron**, **cron-job.org**, or similar
- URL: `https://ai-sidekick.io/api/emails/process-trial`
- Method: POST
- Schedule: Daily at 9 AM

#### Option 3: Manual Testing
```bash
curl -X POST https://ai-sidekick.io/api/emails/process-trial
```

### Database Tracking:

All sent emails are logged in the `email_campaigns` table:
- Prevents duplicate emails
- Tracks email status
- Provides analytics data

### Email Personalization:

Each email includes:
- ✅ User's actual first name
- ✅ User's email for unsubscribe links
- ✅ Custom Canva header
- ✅ Professional design with green checkmarks

### Testing:

1. Create a test user account
2. Manually trigger the automation endpoint
3. Check email_campaigns table for logged sends
4. Verify emails arrive with correct personalization