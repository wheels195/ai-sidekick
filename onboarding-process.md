# AI Sidekick — Customer Onboarding Process

## Overview

This document outlines the complete journey from first inquiry to fully operational AI automation system. AI Sidekick is a done-for-you service — the customer never touches GoHighLevel or any backend software.

---

## PHASE 1: Inquiry & Discovery

### How Leads Come In
- **Website form** (ai-sidekick.io → "Get Your Free Consultation")
  - Collects: Name, phone, email, business type, biggest challenge
- **Vertical landing pages** (hvac.html, dental.html, etc.)
- **Direct calls/texts** from ads or referrals

### What Happens When Someone Inquires
1. **Instant confirmation** — Form submission shows "We got your info! We'll reach out within 24 hours."
2. **You receive the lead** — Name, phone, email, industry, and challenge (missed calls, slow response, no reviews, no follow-up, or all of the above)
3. **Personal outreach within 24 hours** — Call or text the prospect to schedule a discovery call

### Discovery Call (15-20 minutes)
**Goal:** Understand their business, pain points, and current process so you can show them exactly what AI Sidekick fixes.

**Questions to ask:**
- How many calls do you get per day/week?
- What happens when you miss a call right now? (Voicemail? Nothing?)
- Do you have someone answering phones, or is it just you?
- How do you follow up with leads who got a quote but didn't book?
- How many Google reviews do you have? Are you actively asking for them?
- What's your average job/client worth? (Helps frame ROI)
- What software do you currently use? (Scheduling, CRM, etc.)
- What's your biggest frustration with how leads are handled today?

**Key talking points:**
- 85% of missed callers never call back (Smith.ai research)
- 78% of customers buy from the first business that responds (Lead Response Research)
- 21x more likely to convert when you respond within 5 minutes (MIT/InsideSales)
- Compare to hiring a receptionist: $2,500-4,000/mo for 8hrs/day vs. $399/mo for 24/7/365
- No contracts, cancel anytime
- Most businesses are live within 24-48 hours

---

## PHASE 2: Close & Kickoff

### Pricing
- **$399/month** — flat rate, all-inclusive
- **$1,500 one-time setup fee** — covers full system build, customization, and training

### What's Included (from the website)
1. Full system setup & customization
2. AI trained on your business & voice
3. Unlimited text-backs & conversations
4. Online booking calendar
5. Automated follow-up sequences
6. Review request automation
7. Lead pipeline & CRM
8. Monthly performance reports
9. Ongoing optimization & support
10. No contracts — cancel anytime

### Once They Say Yes
1. **Collect payment** — $1,500 setup + first month ($399)
2. **Send welcome message/email** with what to expect and what you need from them
3. **Schedule kickoff call** (30-45 minutes) within 1-2 business days

---

## PHASE 3: Kickoff & Information Gathering

### Kickoff Call Agenda (30-45 minutes)
This is where you gather everything needed to build their system.

**Business Information Needed:**
- Business name, address, website
- Business phone number (the one that will trigger missed call text-back)
- Business hours (when AI should handle calls vs. when they answer live)
- Services offered and typical pricing ranges
- Service area / locations served
- How they want appointments scheduled (time slots, duration, buffer time)

**Brand Voice & Messaging:**
- How do they talk to customers? (Casual/friendly? Professional/formal?)
- Any specific phrases they use or want included?
- Anything the AI should NEVER say? (e.g., specific pricing, guarantees)
- How should the AI introduce itself? (e.g., "Hey, this is [Business Name]!")
- What info should the AI collect from leads? (Name, address, issue description, photos?)

**Technical Setup Info:**
- Current phone system/carrier
- Existing scheduling software (if any — may replace or integrate)
- Google Business Profile login (for review automation)
- Any existing CRM data to migrate?

**Review Automation:**
- Link to their Google Business Profile
- When should review requests go out? (After job completion, next day, etc.)
- Custom review request message preferences

---

## PHASE 4: System Build (24-48 hours)

### What You Build in GoHighLevel (Behind the Scenes)

**The customer never sees or touches GoHighLevel.** Everything below is your internal setup checklist.

> **Snapshot tip:** If you've already built a working setup for one industry (e.g., HVAC), save it as a GHL Snapshot. Snapshots clone your funnels, workflows, calendars, pipelines, and settings — so you can apply a pre-built template to each new sub-account and customize from there instead of building from scratch every time.

#### 1. Sub-Account & Phone Setup
- [ ] Create GHL sub-account for the customer
- [ ] Fill in business info: name, address, timezone, language
- [ ] Purchase or port their business phone number via LC Phone
  - Local number: ~$1.15/mo | Toll-free: ~$2.15/mo
- [ ] Complete A2P 10DLC registration (mandatory for US SMS)
  - Brand registration: one-time fee ($4-12)
  - Campaign registration: $4/mo per campaign
  - Required before any SMS can be sent — takes 1-5 business days for approval
- [ ] Configure call forwarding / missed call trigger
- [ ] Set up business hours vs. after-hours rules

#### 2. Missed Call Text-Back
GHL has a built-in missed call text-back toggle, but workflows give more control.

**Basic method:** Settings → scroll to "Enable Missed Call Text Back" → customize message

**Workflow method (recommended):**
- [ ] Go to Automations → Workflows → Create Workflow
- [ ] Set trigger: "Inbound Call" with Call Status = "Missed"
- [ ] Enable "Run Once Per Contact" to prevent repeat texts
- [ ] Add wait step (10-30 seconds delay so it doesn't feel instant/robotic)
- [ ] Add "Send SMS" action with custom text-back message matching brand voice
- [ ] Add "Push Notification to Assigned User" so the owner gets alerted
- [ ] Set up Conversation AI (AI Employee) for two-way SMS responses
  - Train on business FAQs, services, hours, and tone
  - Configure handoff triggers for complex questions
- [ ] Test: Call the number, don't answer, verify text goes out

**SMS costs to know:**
- Standard SMS (10DLC): $0.0119/message
- Toll-free SMS: $0.0175/message
- MMS (with images): $0.03/message
- Messages over 160 characters = multiple segments billed separately

#### 3. AI Employee Setup (Voice + Conversation AI)
GHL's AI Employee suite powers the intelligent responses. $0.13/min for Voice AI (or $97/mo unlimited per sub-account).

- [ ] Enable AI Employee in Agency Settings → Company tab → toggle on
- [ ] Configure Conversation AI for SMS/chat responses
  - Set greeting, tone, and personality to match business brand
  - Train on services, pricing ranges, FAQs, and booking rules
  - Set up intent detection (booking request, quote request, emergency, general inquiry)
- [ ] Configure Voice AI Agent (optional — for live call answering)
  - Set up greeting script and call flow
  - Enable appointment booking directly from voice calls
  - Configure call transfer rules for human handoff
- [ ] Set boundaries: topics the AI should never discuss (exact pricing, legal advice, etc.)

#### 4. Appointment Booking
GHL has a full calendar/scheduling system built in — Service Calendars are ideal for local businesses.

- [ ] Go to Calendars → Calendar Settings → Create Service Calendar
- [ ] Configure appointment types, durations, and buffer time between slots
- [ ] Set availability windows matching the business's actual schedule
- [ ] Link to owner's Google Calendar (Settings → Linked Calendars) to prevent double-booking
- [ ] Set up automated confirmation SMS/email on booking
- [ ] Build appointment reminder workflow:
  - 24 hours before: SMS reminder with appointment details
  - 1 hour before: Final SMS reminder
- [ ] Enable payment collection if needed (Stripe, Square integration)
- [ ] Create booking link for the AI to share in conversations

#### 5. Lead Follow-Up Sequences
- [ ] Set up lead pipeline stages: New → Contacted → Quoted → Booked → Completed
- [ ] Build quote follow-up workflow:
  - Day 1: "Just checking in — any questions about the estimate?"
  - Day 3: "Wanted to make sure you got everything you needed."
  - Day 7: "Still interested? Happy to answer any questions."
  - Day 14: Final follow-up with limited-time incentive (optional)
- [ ] Build new lead nurture sequence for leads that don't book immediately
- [ ] Configure human handoff triggers (when AI should alert the business owner)
- [ ] Set up "Goal" actions — stop the sequence when the contact books or replies

#### 6. Review Automation
GHL has a built-in Reputation Management module with a Guided Review Setup Wizard.

- [ ] Connect Google Business Profile (Settings → Integrations → Google)
- [ ] Use Guided Review Setup Wizard for initial configuration
- [ ] Build post-job review request workflow:
  - Trigger: Contact moves to "Completed" pipeline stage (or manual trigger)
  - Wait step: 2 hours after job completion
  - Send SMS with direct Google review link and friendly custom message
  - If no review in 3 days: one polite follow-up reminder
- [ ] Enable Reviews AI for auto-responses to incoming reviews
  - Suggestive mode: AI drafts response, you approve before posting
  - Autopilot mode: AI responds automatically (use with caution initially)
- [ ] Set up workflow trigger for "Review Received" to track incoming reviews
  - Filter by star rating: auto-respond to 5-star, alert owner for 1-3 star

#### 7. Dashboard, Reporting & Notifications
- [ ] Configure owner notification preferences:
  - Real-time SMS/push alerts for new leads
  - Daily summary email (optional)
- [ ] Set up monthly performance report template:
  - Missed calls caught & texted back
  - Conversations handled by AI
  - Appointments booked
  - Follow-ups sent
  - Reviews requested & received
- [ ] Add the owner as a "Staff" user if they want limited dashboard access
  - Settings → My Staff → Add Employee → set appropriate role/permissions
  - Most clients won't want this — you just send them reports

---

## PHASE 5: Testing & Launch

### Internal Testing (Before Going Live)
- [ ] Call the business number, let it ring — verify text-back fires within seconds
- [ ] Reply to the text — verify AI responds naturally in the brand's voice
- [ ] Book an appointment through the AI — verify it shows on calendar
- [ ] Test appointment reminders (confirmation + reminder sequence)
- [ ] Trigger a follow-up sequence — verify timing and messaging
- [ ] Send a test review request — verify link works and goes to correct Google profile
- [ ] Test after-hours vs. business hours behavior
- [ ] Test human handoff scenario

### Launch Call with Customer (15-20 minutes)
1. **Walk them through how it works** — Show them a live demo
   - "I'm going to call your number right now. Watch your phone."
   - Let it ring, show the instant text-back
   - Reply to the text, show the AI conversation
   - Show the booked appointment on their calendar
2. **Explain what they'll see day-to-day**
   - They'll get notifications when leads come in
   - They'll see appointments appear on their calendar
   - The system handles follow-up automatically
   - They can always text back manually to take over a conversation
3. **Set expectations**
   - First recovered lead usually within the first few days
   - Monthly performance report coming at end of first month
   - "If you ever want to adjust the messaging or timing, just text/call me"
4. **Confirm notification preferences**
   - How do they want to be notified of new leads? (Text, email, app?)
   - Do they want real-time alerts or a daily summary?

---

## PHASE 6: Ongoing Management & Optimization

### First 7 Days
- [ ] Monitor system daily for any issues
- [ ] Check AI conversation quality — are responses accurate and on-brand?
- [ ] Follow up with customer: "How's everything looking? Any conversations you want me to adjust?"
- [ ] Make any messaging tweaks based on real conversations

### First 30 Days
- [ ] Review all conversations and lead outcomes
- [ ] Identify any patterns where AI needs adjustment
- [ ] Send first monthly performance report:
  - Missed calls caught
  - Leads engaged via text
  - Appointments booked
  - Follow-ups sent
  - Reviews requested & received
- [ ] Check-in call with customer to review results and ROI

### Monthly Ongoing
- [ ] Send monthly performance report
- [ ] Optimize AI responses based on conversation data
- [ ] Adjust follow-up timing/messaging based on conversion rates
- [ ] Monitor review generation and suggest improvements
- [ ] Quarterly strategy call (optional but builds retention)

---

## Quick Reference: Customer-Facing Timeline

| Day | What Happens |
|-----|-------------|
| 0 | Customer inquires via website or call |
| 0-1 | You reach out, schedule discovery call |
| 1-3 | Discovery call → customer says yes → payment collected |
| 2-4 | Kickoff call — gather all business info, voice/tone preferences |
| 3-5 | You build the system in GHL (24-48 hours) |
| 4-6 | Internal testing — everything verified working |
| 5-7 | Launch call — live demo, go live, customer sees it in action |
| 7-14 | Monitor & optimize — daily check-ins first week |
| 30 | First monthly performance report |
| Ongoing | Monthly reports, optimization, support |

---

## Handling Common Objections

**"$1,500 setup is expensive."**
→ "That covers building a fully custom system trained on your business — your voice, your services, your hours. It's not a template. And it pays for itself the first time it catches a $2,000+ job from a missed call."

**"$399/month is a lot."**
→ "A part-time receptionist costs $1,500-2,000/month and only works during business hours. This works 24/7/365, handles unlimited conversations, follows up automatically, and gets you reviews. If it recovers even one extra job per month, it more than pays for itself."

**"I don't get that many missed calls."**
→ "Most business owners are surprised. We typically find 20-40 missed calls per month that went straight to voicemail. Even if it's just 10, at your average job value, that's significant revenue walking away."

**"I tried something like this before and it didn't work."**
→ "Most tools give you software and expect you to figure it out. We do everything for you — setup, customization, optimization. You don't log into anything. And there's no contract, so if it's not working, you can cancel anytime."

**"Can I see it in action first?"**
→ "Absolutely. Give me your cell number — I'll set up a quick demo right now and you can see exactly what your customers would experience." (Then demo the missed call text-back live)

**"I need to think about it."**
→ "Totally understand. While you're thinking, keep track of how many calls go to voicemail this week. That's the revenue gap we close. I'll follow up [specific day]."

---

## Your GHL Costs vs. Revenue (Unit Economics)

### Your GoHighLevel Plan
You need the **Unlimited plan ($297/mo)** or **Agency Pro ($497/mo)** to run multiple client sub-accounts.
- **Unlimited ($297/mo):** Unlimited sub-accounts, no SaaS mode
- **Agency Pro ($497/mo):** Adds SaaS mode, white-label mobile app, automated client billing

**Recommendation:** Start with Unlimited ($297/mo). Upgrade to Agency Pro when you have 5+ clients and want automated billing.

### Per-Client Variable Costs (Approximate)
| Cost Item | Estimate |
|-----------|----------|
| Phone number | $1.15/mo |
| A2P campaign fee | $4/mo |
| SMS (est. 500 texts/mo) | ~$6/mo |
| AI Employee (Conversation AI) | $0.13/min or $97/mo unlimited |
| Voice AI (if enabled) | $0.13/min or included in $97/mo |
| Total variable per client | ~$15-110/mo depending on AI plan |

### Revenue per Client
| Item | Amount |
|------|--------|
| Setup fee (one-time) | $1,500 |
| Monthly recurring | $399/mo |

### Break-Even Analysis
| Clients | Monthly Revenue | Your GHL Cost | Variable Costs | Net Profit |
|---------|----------------|---------------|----------------|------------|
| 1 | $399 | $297 | ~$50 | ~$52/mo |
| 3 | $1,197 | $297 | ~$150 | ~$750/mo |
| 5 | $1,995 | $297 | ~$250 | ~$1,448/mo |
| 10 | $3,990 | $497 | ~$500 | ~$2,993/mo |
| 20 | $7,980 | $497 | ~$1,000 | ~$6,483/mo |

*Plus setup fees: 10 clients = $15,000 in one-time revenue*

---

## Key GHL Resources

- [GHL Missed Call Text-Back Setup](https://help.gohighlevel.com/support/solutions/articles/48001239140)
- [AI Employee Overview](https://help.gohighlevel.com/support/solutions/articles/155000003906)
- [Voice AI Agents](https://help.gohighlevel.com/support/solutions/articles/155000003911)
- [Creating Service Calendars](https://help.gohighlevel.com/support/solutions/articles/155000001159)
- [Review Automation Workflows](https://help.gohighlevel.com/support/solutions/articles/155000003873)
- [A2P 10DLC Registration & Fees](https://help.gohighlevel.com/support/solutions/articles/155000005200)
- [SMS Pricing Calculator](https://help.gohighlevel.com/support/solutions/articles/48001203458)
- [Sub-Account Setup Guide](https://ghl-services-playbooks-automation-crm-marketing.ghost.io/highlevel-sub-account-guide-setup-transfer-optimization-for-agencies/)
- [Client Onboarding Checklist](https://supplygem.com/gohighlevel-client-onboarding-checklist/)
- [GHL Pricing & Billing Guide](https://help.gohighlevel.com/support/solutions/articles/155000001156)

---

## Internal Notes

- **GoHighLevel is never mentioned to customers.** The product is "AI Sidekick" — a done-for-you service. Customers don't know or care what platform runs it.
- **The customer never logs into GHL.** If they need to see anything, you show them or send screenshots/reports.
- **You are the point of contact.** Not a support ticket system. Personal, direct communication (call/text) is the differentiator.
- **DFW focus** — local businesses, in-person relationship building is an advantage. Offer to meet in person when possible.
- **Snapshot strategy** — Build one solid setup per industry, save as a Snapshot, and reuse. Cuts build time from 24-48 hours to 2-4 hours per client after the first one.
- **A2P registration lead time** — Submit brand/campaign registration ASAP after close. It can take 1-5 business days for carrier approval. Don't promise "live in 24 hours" until registration is approved or use toll-free as a faster alternative.
