@echo off
echo Forcing Vercel deployment update...
echo.

echo Step 1: Clear local Vercel cache
if exist .vercel rmdir /s /q .vercel

echo Step 2: Force deploy to production
vercel --prod --force --yes

echo.
echo Deployment complete!
echo Your app should be updated at: https://story-character-tracker.vercel.app
echo.
echo If the password screen still doesn't appear, try:
echo 1. Hard refresh the browser (Ctrl+F5)
echo 2. Clear browser cache
echo 3. Open in incognito/private browsing mode
echo.
pause
