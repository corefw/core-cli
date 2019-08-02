/**
 * @file
 * Defines the Core.cli.pm.Inspector class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { GLOBAL_MODULES, YARN_GLOBAL, WHICH_PM, PATH, _ } = Core.deps( "global-modules", "yarn-global", "which-pm", "path", "_" );

/**
 * A utility class for resolving information about local packages and package managers.
 *
 * @memberOf Core.cli.util.pm
 * @extends Core.abstract.Component
 */
class Inspector extends Core.cls( "Core.abstract.Component" ) {

	$construct( fileSystem ) {

		// Require the `fileSystemAdapter` class dep
		this._fileSystem = this.$require( "fileSystem", {
			instanceOf: "Core.fs.FileSystem",
		} );

	}

	/**
	 * The file system the Inspector will use for file system operations.
	 *
	 * todo: Because we use modules for many of the operations in this class, it cannot
	 *   truly support the virtual file system provided by the Framework.  In the future,
	 *   we should replace the modules with built-in logic, using the file system adapter
	 *   for all file ops.
	 *
	 * @access public
	 * @type {Core.fs.adapter.Base}
	 */
	get fileSystem() {
		return this._fileSystem;
	}

	get fs() {
		return this.fileSystem;
	}


	/**
	 * Returns the root path of the Core CLI (this module).
	 *
	 * @access public
	 * @type {string}
	 */
	get cliRootPath() {
		return PATH.join( __dirname, "../.." );
	}

	/**
	 * Resolves the name of the package manager used to install the Core CLI (this module).
	 *
	 * @async
	 * @public
	 * @returns {Promise<string>} The name of the package manager used to install the Core CLI (this module).
	 */
	async getPmNameForCli() {

		return WHICH_PM( this.cliRootPath ).then(
			function( res ) {
				return res.name;
			}
		);

	}

	/**
	 * Resolves the path for global NPM modules (by way of the 'global-modules' module).
	 *
	 * @async
	 * @public
	 * @returns {Promise<string>} The root path for global NPM modules.
	 */
	async getNpmGlobalPath() {
		return GLOBAL_MODULES;
	}

	/**
	 * Resolves the path for global Yarn modules (by way of the 'yarn-global' module).
	 *
	 * @async
	 * @public
	 * @returns {Promise<string>} The root path for global Yarn modules.
	 */
	async getYarnGlobalPath() {
		return YARN_GLOBAL.getDirectory();
	}

	/**
	 * Resolves the path for global modules based on which package manager was used to install the Core CLI.
	 *
	 * @async
	 * @public
	 * @returns {Promise<string>} The root path for global modules.
	 */
	async getGlobalPath() {

		// Locals
		let me = this;

		// Figure out which PM was used to install the CLI
		let pmName = await me.getPmNameForCli();

		// Based on the PM used to install the CLI utility, return the global path...
		switch( pmName.toLowerCase() ) {

			case "npm":
				return me.getNpmGlobalPath();

			case "yarn":
				return me.getYarnGlobalPath();

			default:
				throw new Error( "An unrecognized or unsupported package manager ('" + pmName + "') was used to install the Core CLI utility.  The Core CLI utility must be able to introspect the global modules of its package manager in order to load CLI plugins." );

		}

	}

	/**
	 * Resolves the path for global modules based on which package manager was used to install the Core CLI
	 * and returns a `Core.fs.Directory` representing that path.
	 *
	 * @async
	 * @public
	 * @returns {Promise<Core.fs.Directory>} The root directory for global modules.
	 */
	async getGlobalDirectory() {

		// Locals
		let me = this;

		// Resolve the global path
		let globalPath = await me.getGlobalPath();

		// Case to a `Core.fs.Directory` and return..
		return me.fs.dir( globalPath );

	}


	async getGlobalModules( opts = null ) {

		// Locals
		let me = this;

		// Resolve global directory
		let globalPath = await me.getGlobalDirectory();

		// Defer to `getModulesAt`
		return me.getModulesAt( globalPath, opts );

	}

	async getModulesAt( location, opts = null ) {

		// Locals
		let me = this;

		// Apply default options
		opts = _.defaults( {}, opts, {
			returnAsObject    : false,
			returnStringPaths : false,
			match             : null
		} );

		// If `location` is a string, convert it to a Core.fs.Directory
		if( _.isString( location ) ) {
			location = me.fileSystem.dir( location );
		}

		// Scan the target
		let paths = await location.getSimpleContents();



		//console.log( paths );

	}

	async getGlobalModulesMatching( match ) {



	}



}

module.exports = Inspector;
