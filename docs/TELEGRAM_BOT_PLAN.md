# Telegram Bot Reminder Plan

This is a future upgrade plan only. No bot, database, auth, cron, or paid service is implemented in the MVP.

## User Flow

1. User selects a team from the Fan Hub.
2. User selects or confirms their timezone.
3. User chooses reminder types.
4. Bot sends match reminders for that team.
5. User can unsubscribe at any time.

## Reminder Types

- 24 hours before kickoff
- 3 hours before kickoff
- 1 hour before kickoff
- Confirmed lineup available
- Predicted lineup update
- Key injury update
- Opponent watch update
- Kickoff
- Full-time result
- Your team's next match card
- Lineup available, future
- Injury update, future

## Future Requirements

- Telegram bot token from BotFather
- Database for subscriptions, team choices, timezone, reminder preferences, and unsubscribe state
- Cron or scheduled worker for reminder dispatch
- Match data source, initially manual JSON or cached API data
- Delivery logs for debugging failed sends
- Rate-limit handling so the bot does not spam users

## Data Model Sketch

- `telegramUserId`
- `teamId`
- `timezone`
- `reminderTypes`
- `status`
- `createdAt`
- `updatedAt`
- `unsubscribedAt`

## Privacy Notes

- Store the minimum required data: Telegram user id, selected team, timezone, and reminder preferences.
- Do not store chat history.
- Provide a clear unsubscribe command.
- Delete or anonymize inactive subscriptions if the product is abandoned.

## Unsubscribe Flow

- `/stop` disables all reminders.
- `/teams` lets the user change followed teams.
- `/timezone` lets the user update timezone.
- Reminder messages should include a short unsubscribe hint.

## MVP Boundary

For launch, the site only shows reminder placeholders. Real reminders should be added only after enough users show intent by clicking team pages or reminder CTAs.
