# youming-site-tests

Functional tests for [youming-site](https://github.com/Forfeit-15/youming-site), written in Playwright with TypeScript.

Tests are written from [SPEC.md](SPEC.md) and issue text only, never from the site's source code. Each test names the SPEC.md line it checks.

## Running

```sh
npm install
npx playwright install
BASE_URL=https://your-live-site.example npx playwright test
```

On Windows PowerShell, set the URL with `$env:BASE_URL = "https://..."` first.
