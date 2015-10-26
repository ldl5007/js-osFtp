# js-osFtp

This Brackets extension uses native OS services for FTP.  Native OS FTP services are more robust and work well when other extensions fall short, 
for example, at the time this was created, no existing Bracket's FTP extension could propertly FTP to and from z/OS.

--- 
## FTP Files to a Remote Destiniation

Right click a file in the Working file set or Project set and 'New Ftp Site...'

![alt text][newFtpSite]

Fill in the dialog:

![alt text][addFtpSite]

The dialog input field scriptions are:

| Input     | Description                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
| Site Name | name for the site                                                                                         |
| Host      | host name, to specify a port use a space between hostname and port without quotes (e.g. `hostname port`)  |
| Root      | Remote directory to ftp to                                                                                |
| User      | User name                                                                                                 |
| Password  | Password                                                                                                  |

Right click a file in the Working file set or Project set and select the site you added.  This builds
a script file in the extension directory and executes the script:

![alt text][runSite]

You will receive a confirmation prompt if attemping to upload an entire directory.

---

## Run Your Own FTP Script

Create an FTP script file like the following example supplying your own user name and password for myUserName and myPassword respectively and altering the local directory (lcd) and remote directory (cd) to the desired local and remote locations.

Note: The ftp executable is invoked with the -ins options so autologin is supressed (you must specify the keyword 'user') and interactive mode is defaulted to be OFF:

    open 192.168.0.106
    user 
    myUsername
    myPassword
    lcd C:\Users\myUser\dev
    cd dev
    mput *
    quit
  
Right click a file (not a directory) in the Working file set or Project set and 'Run as FTP Script'


[newFtpSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/newFtpSite.PNG "New Ftp Site..."
[addFtpSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/addFtpSite.PNG "Add Ftp Site"
[runSite]: https://github.com/dkelosky/js-osFtp/blob/master/images/runSite.PNG "Run Site"
