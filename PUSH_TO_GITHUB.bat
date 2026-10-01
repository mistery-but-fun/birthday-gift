@echo off
title Pushing Panda Birthday World to GitHub
color 0A
cd /d "%~dp0"

echo ====================================================================
echo   PUSHING PANDA'S MAGICAL BIRTHDAY WORLD TO GITHUB
echo   Repository: https://github.com/mistery-but-fun/birthday-gift
echo ====================================================================
echo.
echo Please authorize in the browser pop-up if prompted...
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================================
    echo   [SUCCESS] All files uploaded to GitHub successfully!
    echo   Now you can deploy on Streamlit Community Cloud!
    echo ====================================================================
) else (
    echo ====================================================================
    echo   [FAILED] Push did not complete. If prompted to sign in, please
    echo   authorize your 'mistery-but-fun' account in the browser.
    echo ====================================================================
)
echo.
pause
