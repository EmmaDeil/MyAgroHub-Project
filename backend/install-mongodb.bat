@echo off
echo Installing MongoDB Community Server...
echo This will take a few minutes...

:: Download MongoDB Community Server
echo Downloading MongoDB...
curl -L -o mongodb-installer.msi "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi"

if exist mongodb-installer.msi (
    echo Installing MongoDB...
    msiexec /i mongodb-installer.msi /quiet /norestart
    
    echo Waiting for installation to complete...
    timeout /t 30 /nobreak
    
    echo Starting MongoDB service...
    net start MongoDB
    
    echo MongoDB installed and started successfully!
    echo Connection string: mongodb://localhost:27017/agritech
    
    del mongodb-installer.msi
) else (
    echo Download failed. Please install MongoDB manually from:
    echo https://www.mongodb.com/try/download/community
)

pause
