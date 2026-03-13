# Client Operations Playbook

Operational guide for onboarding clients, deploying GHL voice AI, and running accounts. Based on enterprise-scale deployment learnings (Fur Patel / Rapid Talk AI).

---

## Deployment Process

1. **Sales** — Demo call, show pre-recorded demo page for their niche
2. **Development** — Push snapshot, configure prompts/workflows, set up phone number
3. **QA** — Run through QA checklist (below), test all call scenarios
4. **Client Feedback** — Ask client to rate 1-10 confidence before going live
5. **Go Live** — Flip to production, monitor daily
6. **30-Day Monitoring** — Spot-check transcripts daily, catch issues before client complains

## QA Checklist (Before Go-Live)

- [ ] Workflows enabled and tested
- [ ] Phone number assigned and forwarding configured
- [ ] Call recording ON (verbal disclosure in greeting)
- [ ] Transcripts sending to client email
- [ ] Custom values populated (business name, hours, services, address)
- [ ] Calendar OAuth connected (client must do this themselves)
- [ ] A2P 10DLC registration submitted
- [ ] Missed call text-back tested
- [ ] SMS follow-up sequences active
- [ ] Google review request URL configured
- [ ] Test 5+ call scenarios end-to-end

## Transcript Categorization

Process call transcripts into action buckets and include category in email subject line so staff can prioritize:

- **Billing** — Payment questions, invoice disputes
- **Cancellation** — Cancel requests, retention opportunities
- **Callback Required** — AI couldn't resolve, needs human follow-up
- **Appointment Booked** — Successfully scheduled
- **General Inquiry** — Info requests handled by AI
- **Transfer** — Call transferred to live staff

This lets front desk staff scan email subjects and handle urgent items first instead of reading every transcript.

## Sales Approach

### Entry Point: After-Hours Agent
- Easiest sell — "your phones ring after 5pm and nobody answers"
- Low risk for client, immediate value
- Expand to full-hours coverage once they see results

### Value-Based Pricing
- Frame against receptionist salary ($30-45k/year) — our $397/mo is fraction of that
- Frame against missed revenue — if one missed call = one lost job worth $500+, service pays for itself immediately
- Don't compete on price, compete on what they're losing without it

### Demo Strategy
- Build pre-recorded demo pages per niche (don't ask prospects to call a live demo)
- Show real transcript examples from that industry
- Chamber of commerce events and local business networking = top acquisition channel for enterprise/franchise clients

## Agent Configuration Best Practices

### Don't Over-Customize
- Offer 2-3 pre-built agent templates per vertical (not unlimited customization)
- Standardized templates are easier to QA and maintain
- Customization = more QA time = more things to break

### Confidence Scoring
- Before go-live, ask client: "On a scale of 1-10, how confident are you?"
- If below 8, address concerns before flipping live
- Sets expectations and surfaces objections early

### Ongoing Monitoring
- First 30 days: spot-check transcripts daily
- Look for: incorrect info, missed transfers, awkward responses, failed bookings
- Fix issues proactively — don't wait for client to complain
- After 30 days: weekly spot-checks, monthly review with client

## Value-Add Features to Implement

- **Transcript email categorization** — Tag subject lines with call type
- **Weekly summary reports** — Calls handled, appointments booked, missed calls prevented
- **After-hours vs business-hours split** — Show clients how many after-hours calls they'd have missed
- **Response time tracking** — Average time to text-back, average call answer time
