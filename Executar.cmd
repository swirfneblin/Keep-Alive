@ECHO off
ECHO Configurando pacotes

SET npmfile=npm.cmd
SET npmpath=nao
FOR /F %%I in ('where.exe ^"%npmfile%^" /F') do SET npmpath=%%I

IF EXIST  "%npmpath%" (
	CMD /C "%npmpath% install ." %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  CMD /C npm install
)

ECHO Executando script, aguarde!

SET nodefile=node.exe
SET nodepath=nao
FOR /F %%I in ('where.exe ^"%nodefile%^" /F') do SET nodepath=%%I

IF EXIST "%nodepath%" (
	CMD /C "%nodepath% .\index.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  CMD /C node.exe .\index.js
)

PAUSE