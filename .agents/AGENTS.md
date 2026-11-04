# Ekho Project Rules

## Git workflow
- After every completed update (once `npx tsc --noEmit` and `npx expo lint` pass), commit the changes and immediately run `git push origin main`. Never leave verified work unpushed.
- Never commit `.env` or other secret files.
