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
Run-Checked "npm run build"
