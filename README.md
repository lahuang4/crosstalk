# crosstalk

## Installation

The following installation instructions are for a fresh Ubuntu 14.04 machine.

1. `sudo apt-get update`
2. `sudo apt-get install git`
3. Get Node.js 4.4.4:  
 `wget -qO- https://deb.nodesource.com/setup_4.x | sudo bash -`
4. `sudo apt-get install --yes nodejs`
5. `git clone https://www.github.com/lahuang4/crosstalk`
6. `cd crosstalk`
7. Install the required Node packages:  
 `npm install`
8. If you'd like to run the directory on your own machine, change the corresponding directory IP address in server/server.js and run the directory:  
 `nodejs directory/directory.js`
9. Start the server (in another window, if you're running the directory as well):  
 `nodejs server/server.js`
10. Start the client GUI in another window:  
 `npm start`
11. Now you can open up the GUI at [http://localhost:3000](http://localhost:3000), and start chatting!