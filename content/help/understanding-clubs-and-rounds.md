# Understanding Clubs and Rounds

Clubs and rounds are the core building blocks of Meet 4 Coffee. Understanding how they work helps you design better team connections.

## What Is a Club?

A club is a group of people who meet regularly on a defined schedule. Think of it as a "recurring meeting series" with rotating participants.

### Club Settings

| Setting | Description |
|---------|-------------|
| Name | How members identify the club |
| Frequency | Weekly, biweekly, or monthly |
| Group Size | Pairs (2) or small groups (3-4) |
| Duration | How long meetings last |
| Anchor Day/Time | When meetings typically occur |

### Club Membership

People join clubs voluntarily (or can be added by owners). Membership means:
- They're included in round matchups
- They get notifications about meetings
- They can see other club members

## What Is a Round?

A round is a single iteration of a club's meetings. If a club meets weekly, each week is a new round.

### Round Lifecycle

1. **Draft**: Created but not yet confirmed
2. **Scheduled**: Confirmed and invitations sent
3. **Completed**: Meetings have happened
4. **Canceled**: Round was canceled (Boss Button or manual)

### Matchups

For each round, Meet 4 Coffee generates matchups:
- **Pairs**: Two people per meeting
- **Groups**: 3-4 people per meeting (depending on settings)

The algorithm respects:
- Opt-out preferences
- Previous matchups (avoids recent repeats)
- Availability windows

## Configuration Options

### Meeting Mode

**Single Shared**: Everyone in the club meets at the same time (good for team-wide bonding)

**Generated Groups**: Smaller breakout meetings (better for individual connections)

### Assignment Policy

**Mandatory**: Members are automatically included in rounds

**Optional**: Members choose to join each round

### Join Policy

**Free Join**: Anyone can join the club

**Approval Required**: Club owner approves new members

**Owner Only**: Only workspace owners can add members

### Visibility

**Public**: All workspace members can see the club

**Hidden**: Only members see the club exists

## Scheduling Deep Dive

### Anchor Points

Rounds are scheduled relative to an anchor:
- **Anchor weekday**: The day of the week (e.g., Tuesday)
- **Anchor time**: The time of day (e.g., 2:00 PM)

### Period Keys

Each round has a unique period key like `2024-W01` (week 1 of 2024). This helps track rounds over time.

### Rescheduling

Participants can propose new times:
1. Click **Reschedule** on their meeting
2. Propose new time slots
3. Other participant accepts/rejects
4. If accepted, the meeting updates automatically

## Integration Features

### Google Calendar

- Calendar events created automatically
- Meeting links included in descriptions
- Updates sync both ways

### Slack

- Notifications sent to members
- Reminders before meetings
- Summary after rounds complete

## Analytics

Track your club's health:

- **Participation rate**: % of members attending
- **Reschedule rate**: How often meetings move
- **Attendance trends**: Over time

## Advanced Tips

### Multiple Clubs Strategy

Many successful teams run multiple clubs:
- **All-hands**: Everyone meets everyone (quarterly)
- **Cross-functional**: Engineering + Design (monthly)
- **Random coffee**: Weekly serendipity (weekly)
- **Leadership**: Managers only (biweekly)

### Optimal Group Sizes

- **Pairs (2)**: Deep 1:1 conversations, easiest to schedule
- **Trios (3)**: Dynamic without being chaotic
- **Quads (4)**: Group energy, harder to schedule

Start with pairs, experiment as your team gets comfortable.

### Timing Matters

- **Morning**: Higher energy, but conflicts with standups
- **Mid-day**: Breaks up the day, good for remote workers
- **Late afternoon**: Wind-down conversations, risk of fatigue

## Troubleshooting

### Low Participation

- Check if timing works for most time zones
- Review opt-out lists (maybe too many conflicts)
- Reduce frequency (biweekly instead of weekly)
- Consider making participation optional

### Awkward Matchups

- Encourage profile completion (better matching)
- Review and adjust opt-out preferences
- Add conversation prompts for the club

### Scheduling Conflicts

- Enable rescheduling
- Add availability windows to profiles
- Consider multiple time slot options

---

*Next: Learn about [Slack Integration](/help/slack-integration-guide) for seamless notifications.*
