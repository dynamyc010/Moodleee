# Moodleee (needing of a rebrand tbh)
 A Discord bot used for gathering your due assignments from Moodle to Discord.

## Currently it can:
- Register multiple users
- Gather your assingments (and mark them as done in the bot because the API is dumb)
- Send you a reminder every 12 hours (currently at 6AM and 6PM, configurable in the config)
- Make you cry how bad the Moodle REST API is

## Planned:
- Gather assignments you missed (and haven't given in anything for)
- <s>Figure out what the hell most of the API does</s> I give up
- Warn user ~2 hours before the deadline. <s>Otherwise, send a DM every 12 hours. (Maybe at 6AM and 6PM?)</s> (<i>This part's done.</i>)

## Possible improvements:
- Break up the register file a little... <i>it got messy real quick lol</i>
- Move the tokens off to either a real database or at least a separate file. Either that, or move it into RAM, but that might get a bit crappy to use. (But it is the best for security!)