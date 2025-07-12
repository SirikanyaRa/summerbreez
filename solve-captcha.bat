@echo off
echo ===================================
echo Postcode.my CAPTCHA Solver Utility
echo ===================================
echo.
echo This utility will help you solve CAPTCHA issues with postcode.my
echo It will open a browser window where you can solve the CAPTCHA manually
echo.
echo Press Ctrl+C to exit at any time
echo.

set /p URL="Enter postcode.my URL (or just the path part): "

if "%URL%"=="" (
  echo No URL provided, using default example
  set URL=pahang-kuantan-jalan-aspa-26080.html
)

echo.
echo Starting CAPTCHA solver for: %URL%
echo.
echo Wait for browser to open...
echo.

node ./script/captcha-solver.js %URL% --show

echo.
echo CAPTCHA solver completed.
echo Check the terminal output for cookies and verification results.
echo.
pause
