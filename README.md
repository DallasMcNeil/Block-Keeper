# Block Keeper 1.3.3

Block Keeper is a cross platform desktop cubing timer. Block Keeper provides an event based session system with an elegent interface to provide relevant statistics and tools for speedcubing.

![alt text](https://github.com/DallasMcNeil/Block-Keeper/blob/master/docs/images/blockkeeper.gif)

Main Features:

- Cross platform support, Windows, MacOS and Linux
- Completely offline and no Java required
- Customizable event based session organisation
- Simple and stylish interface with multiple themes
- Scrambler for all WCA events and more
- WCA inspection support with voice announcements
- Blind and one handed event accomidations
- Event and session results graphs
- Video recorder to view and save last solve
- Stackmat support
- Session import and export

If you encounter any bugs, issues or want to suggest any improvements, please let me know so I can make Block Keeper even better. You can contact me on Twitter [@dmcneil_](https://twitter.com/dmcneil_) or email [dallas@dallasmcneil.com](mailto:dallas@dallasmcneil.com).

## Documentation

An extensive guide for using Block Keeper is available [here](https://dallasmcneil.com/projects/blockkeeper/guide).
  
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

Once you download the source from Github. Navigate to the downloaded folder using the command line and run the setup script. You will need [npm](https://www.npmjs.com/get-npm) installed. All scripts use bash.

`./setup`

This will download and install the required packages, it may take some time to install everything. 

Once that has finished use the start script to run and test the current source.

`./start`

Use the export script to create a standalone application. You can edit the script to add or change options. For more options for exporting see [here](https://github.com/electron-userland/electron-packager/blob/master/docs/api.md). By default, the script will create an application for your current platform.

`./export`

## Debuging

A debug console is available to use for debugging and other purposes. In the titlebar select `Window > Toggle Dev Tools`.

## Contributors

Dallas McNeil ([dallasmcneil.com](https://dallasmcneil.com))

Nicolas Brassard ([https://github.com/awesomecuber](https://github.com/awesomecuber))

James Hamm ([https://github.com/jameshamm](https://github.com/jameshamm))

A huge thanks to the people who made these fantastic libraries, tools and assets, which make Block Keeper possible.

### Tools and Libraries

- [electron/electron](https://github.com/electron/electron) 
- [jviotti/electron-json-storage](https://github.com/jviotti/electron-json-storage)
- [ragingwind/electron-shortcut](https://github.com/ragingwind/electron-shortcut)
- [mawie81/electron-window-state](https://github.com/mawie81/electron-window-state)
- [muaz-khan/RecordRTC](https://github.com/muaz-khan/RecordRTC)
- [less/less.js](https://github.com/less/less.js)
- [DmitryBaranovskiy/raphael](https://github.com/DmitryBaranovskiy/raphael)
- [cs0x7f/stackmat](https://github.com/cs0x7f/stackmat)
- [jquery/jquery](https://github.com/jquery/jquery)
- [jquery/jquery-ui](https://github.com/jquery/jquery-ui)
- [cubing/jsss](https://github.com/cubing/jsss)
- [nickcolley/scrambo](https://github.com/nickcolley/scrambo)
- [wesleycho/confetti.js](https://github.com/wesleycho/confetti.js/)
- [torjusti/cube-solver](https://github.com/torjusti/cube-solver)

### Fonts

- Sizenko Alexander Style-7 [www.styleseven.com](http://www.styleseven.com)
- Wei Huang [wweeiihhuuaanngg@gmail.com](mailto:wweeiihhuuaanngg@gmail.com)

## License

Block Keeper is licensed under the GNU General Public License.
