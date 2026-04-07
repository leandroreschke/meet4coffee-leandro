# Slack Integration Guide

Connect Meet 4 Coffee with Slack to keep your team in the loop without leaving their workflow.

## What the Integration Does

Once connected, Meet 4 Coffee can:

- **Send notifications** about upcoming coffee chats
- **Post reminders** before meetings start
- **Share summaries** after rounds complete
- **Receive commands** for quick actions (coming soon)

## Setting Up the Integration

### Step 1: Connect Slack

1. Go to **Config > Integrations**
2. Click **Connect Slack**
3. Authorize Meet 4 Coffee in your Slack workspace
4. Select the default channel for notifications

### Step 2: Configure Notifications

Choose what gets posted to Slack:

| Event | Recommended? |
|-------|--------------|
| New round scheduled | Yes |
| Meeting reminders | Yes |
| Round completed summary | Yes |
| Member joins/leaves | Optional |

### Step 3: Test It

1. Create a test round
2. Check that the notification appears in Slack
3. Verify meeting links work

## Notification Types

### New Round Scheduled

```
☕ New Coffee Club Round Scheduled

Weekly Coffee Chat - Round 12
Meetings: Tuesday, Jan 16 at 2:00 PM

Check your calendar for your meeting slot!
```

### Meeting Reminder

```
⏰ Coffee Chat in 30 Minutes

Your chat with @alex starts soon.
Join: [Meeting Link]
```

### Round Summary

```
✅ Coffee Club Round Complete

Weekly Coffee Chat - Round 12
Participation: 87% (13/15 members)

Great work connecting this week! ☕
```

## Channel Setup

### Dedicated Channel (Recommended)

Create a `#coffee-chats` channel:
- Keeps notifications organized
- Members can mute if needed
- Easy to find historical info

### General Channel

Post to `#general` or `#random`:
- More visibility
- Might be noisy
- Good for smaller teams

## Per-Club Configuration

Different clubs can post to different channels:

1. Go to your **Club** page
2. Click **Settings**
3. Set **Slack Channel**
4. Save

Example setup:
- Engineering club → `#engineering-social`
- Company-wide club → `#general`
- Leadership club → `#leadership-private`

## Member Preferences

Members control their own notification settings:

1. Go to **Profile > Notifications**
2. Toggle Slack notifications
3. Choose notification types

## Troubleshooting

### Notifications Not Appearing

- Check the integration is connected (Config > Integrations)
- Verify the bot is in the correct channel
- Confirm notification settings are enabled

### Wrong Channel

- Update the default channel in integration settings
- Or set per-club channels in club settings

### Member Not Receiving DMs

- Member needs to authorize the Slack app
- Check their notification preferences
- Verify they're a member of the configured channel

### Duplicate Notifications

- Check if multiple integrations are connected
- Verify club and workspace settings aren't conflicting
- Review member notification preferences

## Privacy and Permissions

### What We Can See

The Slack integration can:
- Post to channels you authorize
- Send DMs to members who opt-in
- Read basic workspace info (name, members)

### What We Can't See

We cannot:
- Read message history
- Access private channels without invitation
- Send messages to non-members

## Advanced: Custom Workflows

### Slack Commands (Beta)

Coming soon:
- `/coffee status` - Check your upcoming chats
- `/coffee opt-out` - Skip next round
- `/coffee reschedule` - Propose new time

### Webhook Integration

For custom workflows, use our webhook API to trigger Slack notifications through your own systems.

## Best Practices

### Start Minimal

Begin with just "new round" notifications. Add more as your team gets comfortable.

### Respect Attention

Too many notifications = ignored notifications. Find the right balance for your team.

### Use DMs Sparingly

Direct messages are intrusive. Reserve them for:
- Meeting reminders
- Important updates
- Opt-in digests only

### Celebrate Participation

Use round summaries to highlight participation rates. Positive reinforcement builds habit.

## Removing the Integration

1. Go to **Config > Integrations**
2. Click **Disconnect Slack**
3. Confirm

All Slack notifications will stop immediately. Meeting functionality continues normally.

## Need Help?

- Check our [Help Center](/help) for more guides
- Review [Getting Started](/help/getting-started) for workspace setup
- Learn about [Clubs and Rounds](/help/understanding-clubs-and-rounds)

---

*Your Slack integration is ready! Time to brew some connections. ☕*
