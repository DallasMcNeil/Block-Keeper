# Block Keeper 1.0.2

Block Keeper is a cross platform desktop cubing timer. Block Keeper provides an event based session system with an elegent interface to provide relevant statistics and tools for speedcubing.

![alt text](https://github.com/DallasMcNeil/Block-Keeper/blob/master/docs/images/blockkeeper.gif)

Main Features:

- Cross platform support, Windows, MacOS and Linux
- 100% offline and no Java required
- Event based session organisation
- Simple and stylish interface with multiple themes
- Scrambler for all WCA events
- WCA inspection support with voice announcements
- Event and session graphs
- Video recorder to view and save last solve
- Stackmat support
- Session import and export

If you encounter any bugs, issues or want to suggest any improvements, please let me know so I can make Block Keeper even better. You can contact me on Twitter [@dmcneil_](https://twitter.com/dmcneil_) or email [dallas@dallasmcneil.com](mailto:dallas@dallasmcneil.com).

## Documentation

An extensive guide for using Block Keeper is available [here](http://dallasmcneil.com/projects/blockkeeper/guide).
  
## Download

A precompiled version of Block Keeper for Windows, MacOS and Linux is available [here](http://dallasmcneil.com/projects/blockkeeper).

## Development

You can edit Block Keeper's source in a couple of ways.

### In Precompiled

Block Keeper uses Github's [Electron](https://electron.atom.io) and the source is available to view or change in every copy. 

On Windows and Linux, the source is available in the `resources` folder. On MacOS you will need to view the package contents to find the `resources` folder.

To test your code, just run the application.

However, I don't recommend this method past making very small changes as it doesn't provide much flexibility.

### From Source

Once you download the source from Github. Navigate to the download folder using the command line and run the setup script. You will need [npm](https://www.npmjs.com/get-npm) installed. All scripts use bash.

`./setup`

This will download and install the required packages, it may take some time to install everything. 

Once that has finished use the start script to run and test the current source.

`./start`

Use the export script to create a standalone application. You can edit the script to add or change options. For more options for exporting see [here](https://github.com/electron-userland/electron-packager/blob/master/docs/api.md). By default, the script will create an application for your current platform.

`./export`

## Debuging

A debug console is available to use for debugging and other purposes. In `src/main.js` at the top, set `var debug = true` to use it. **Remeber** to set debug to false to hide the console.

## Contributors

Dallas McNeil ([dallasmcneil.com](http://dallasmcneil.com))

James Hamm ([https://github.com/jameshamm](https://github.com/jameshamm))

A huge thanks to the people who made these fantastic libraries, tools and assets, which make Block Keeper possible.

### Tools and Libraries

- [electron/electron](https://github.com/electron/electron) 
- [jviotti/electron-json-storage](https://github.com/jviotti/electron-json-storage)
- [ragingwind/electron-shortcut](https://github.com/ragingwind/electron-shortcut)
- [mawie81/electron-window-state](https://github.com/mawie81/electron-window-state)
- [muaz-khan/RecordRTC](https://github.com/muaz-khan/RecordRTC)
- [less/less.js](https://github.com/less/less.js)
- [DmitryBaranovskiy/raphael](https://github.com/DmitryBaranovskiy/raphael/blob/master/license.txt)
- [cs0x7f/stackmat](https://github.com/cs0x7f/stackmat)
- [jquery/jquery](https://github.com/jquery/jquery)
- [jquery/jquery-ui](https://github.com/jquery/jquery-ui)
- [cubing/jsss](https://github.com/cubing/jsss)
- [nickcolley/scrambo](https://github.com/nickcolley/scrambo)
- [wesleycho/confetti.js](https://github.com/wesleycho/confetti.js/)

### Fonts

- Sizenko Alexander Style-7 [www.styleseven.com](http://www.styleseven.com)
- Wei Huang [wweeiihhuuaanngg@gmail.com](mailto:wweeiihhuuaanngg@gmail.com)

## License

Block Keeper is licensed under the GNU General Public License.
