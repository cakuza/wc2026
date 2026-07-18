$ErrorActionPreference = "Stop"

function Run-Checked([string]$Command) {
  Write-Host "`n>>> $Command"
  cmd /c $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $($LASTEXITCODE): $Command"
  }
}

Run-Checked "npm ci"
Run-Checked "npm run lint"
Run-Checked "npx tsc --noEmit"
Run-Checked "npm run test:reliability"
Run-Checked "npm run test:cache"
Run-Checked "npm run test:ui"
Run-Checked "npm run test:tournament"
Run-Checked "npx tsx scripts/test-scorer-enrichment.ts"
Run-Checked "npm run test:readiness-validator"

foreach ($directory in @(".next", "out")) {
  if (Test-Path -LiteralPath $directory) {
    Remove-Item -LiteralPath $directory -Recurse -Force
  }
}

Run-Checked "npm run build:p0"
Run-Checked "npx tsx scripts/test-post-merge-production-truth.ts"
Run-Checked "npm run test:runtime:cold-cache"
Run-Checked "npx tsx scripts/test-final-route-content-parity.ts"
Run-Checked "npx tsx scripts/test-final-route-data-parity-hotfix.ts"
Run-Checked "npx tsx scripts/test-post-release-static-parity-hotfix.ts"
Run-Checked "npx tsx scripts/test-post-release-content-visual-audit.ts"
Run-Checked "npx tsx scripts/test-rendered-html.ts"
Run-Checked "npx tsx scripts/test-seo-technical-audit.ts"
Run-Checked "npm run test:browser-qa"
Run-Checked "git diff --check"
