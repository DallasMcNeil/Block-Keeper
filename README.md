# Block Keeper

Block Keeper is a cross platform desktop cubing timer. Block Keeper provides an event based session system with an elegant interface to provide relevant statistics and tools for speedcubing.

![alt text](https://github.com/DallasMcNeil/Block-Keeper/blob/master/docs/images/blockkeeper.gif)

Main Features:

- Cross platform support, Windows, MacOS and Linux
- Completely offline and no Java required
- Customizable event based session organization
- Simple and stylish interface with multiple themes
- Scrambler for all WCA events and more
- WCA inspection support with voice announcements
- Blind and one handed event accommodations
- Event and session results graphs
- Video recorder to view and save last solve
- Stackmat support
- Session import and export

If you encounter any bugs, issues or want to suggest any improvements, please let me know so I can make Block Keeper even better. You can contact me on Twitter [@dmcneil_](https://twitter.com/dmcneil_) or email [dallas@dallasmcneil.com](mailto:dallas@dallasmcneil.com).

## Documentation

An extensive guide for using Block Keeper is available [here](https://dallasmcneil.com/projects/blockkeeper/guide).
  
## Download

A pre-compiled version of Block Keeper for Windows, MacOS and Linux is available [here](http://dallasmcneil.com/projects/blockkeeper), or in the [releases](https://github.com/DallasMcNeil/Block-Keeper/releases) section.

## Development

Once you download the source from Github. Navigate to the downloaded folder using the command line and run the following command. You will need [npm](https://www.npmjs.com/get-npm) installed. All scripts use bash.

`npm install`

This will download and install the required packages, it may take some time to install everything. 

Once that has finished use the following command to run and test the current source.

`npm start`

Use the following command to build a standalone application for the current platform.

`npm run build`

Use the setupVersion script to create standalone applications for all platforms in a `dist` folder. This will also format `package.json`, `updates.json` and the created applications for release. [jq](https://stedolan.github.io/jq/) is required.

`./formatVersion 'versionNumber'`

To generate documentation from `docs/doc.md`, use the `make` script. This requires [pandoc](https://pandoc.org).

## Debuging

A debug console is available to use for debugging and other purposes. In the title-bar select `Window > Toggle Dev Tools`.

## Contributors

Dallas McNeil ([dallasmcneil.com](https://dallasmcneil.com))

James Hamm ([https://github.com/jameshamm](https://github.com/jameshamm))

Mano Ségransan ([https://github.com/ManoSegransan](https://github.com/ManoSegransan))

Nicolas Brassard ([https://github.com/awesomecuber](https://github.com/awesomecuber))

A huge thanks to the people who made these fantastic libraries, tools and assets, which make Block Keeper possible.

### Tools and Libraries

- [electron/electron](https://github.com/electron/electron) 
- [jviotti/electron-json-storage](https://github.com/jviotti/electron-json-storage)
- [ragingwind/electron-shortcut](https://github.com/ragingwind/electron-shortcut)
- [mawie81/electron-window-state](https://github.com/mawie81/electron-window-state)
- [muaz-khan/RecordRTC](https://github.com/muaz-khan/RecordRTC)
- [less/less.js](https://github.com/less/less.js)
- [DmitryBaranovskiy/raphael](https://github.com/DmitryBaranovskiy/raphael)
- [thewca/tnoodle](https://github.com/thewca/tnoodle)
- [cs0x7f/stackmat](https://github.com/cs0x7f/stackmat)
- [cs0x7f/cstimer](https://github.com/cs0x7f/cstimer)
- [jquery/jquery](https://github.com/jquery/jquery)
- [jquery/jquery-ui](https://github.com/jquery/jquery-ui)
- [wesleycho/confetti.js](https://github.com/wesleycho/confetti.js/)
- [torjusti/cube-solver](https://github.com/torjusti/cube-solver)

### Fonts

- Sizenko Alexander Style-7 [www.styleseven.com](http://www.styleseven.com)
- Wei Huang [wweeiihhuuaanngg@gmail.com](mailto:wweeiihhuuaanngg@gmail.com)

## License

Block Keeper is licensed under the GNU General Public License v3. 
