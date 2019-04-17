/**
 * @file
 * Defines the Core.cli.Controller class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { COMMANDER, PATH } = Core.deps( "commander", "path" );


/**
 * The main controller class for the Core CLI Utility (xcc).
 *
 * @memberOf Core.cli
 * @extends Core.app.Application
 */
class Controller extends Core.cls( "Core.app.Application" ) {

	$construct() {

		// Init IOC Dependencies
		this._prepDependencies();

		// Init the commander library
		this._initCommander();

	}

	_prepDependencies() {

		// Locals
		let me 	= this;
		let ioc = me.iocContainer;

		// Init the template parser
		ioc.singleton( "templateParser", function() {
			return me.$spawn( "Core.template.Parser", {} );
		} );

		// Init the root context object
		ioc.singleton( "rootContext", function() {
			return me.$spawn( "Core.context.Context", {} );
		} );

		// Init the local path manager object
		ioc.singleton( "localPathManager", function( ixc ) {

			let rootContext = ixc.resolve( "rootContext" );

			return me.$spawn( "Core.fs.path.Manager", {
				context        : rootContext,
				rootPathPrefix : "/",
				initialPaths   : {
					cwd: process.cwd()
				},
			} );

		} );

		// Init the local file system adapter
		ioc.singleton( "localFsAdapter", function( ixc ) {

			let localPathManager = ixc.resolve( "localPathManager" );

			return me.$spawn( "Core.fs.adapter.Local", {
				pathManager: localPathManager
			} );

		} );

		// Init a CWD directory object
		ioc.singleton( "currentWorkingDirectory", function( ixc ) {

			let fsa = ixc.resolve( "localFsAdapter" );
			return fsa.dir( "${cwd}" );

		} );

		// Init the PM inspector
		ioc.singleton( "pmInspector", function( ixc ) {

			let fsa = ixc.resolve( "localFsAdapter" );

			return me.$spawn( "Core.cli.pm.Inspector", {
				fileSystemAdapter: fsa
			} );

		} );

		// Init the plugin manager
		ioc.singleton( "cliPluginManager", function() {
			return me.$spawn( "Core.cli.plugin.Manager", {} );
		} );

		// Init the command loader
		ioc.singleton( "commandLoader", function() {
			return me.$spawn( "Core.cli.command.Loader", {} );
		} );

		// Add the 'commander' library
		ioc.singleton( "commanderLib", function() {
			return COMMANDER;
		} );

		// Add the console output handler
		ioc.singleton( "outputHandler", function() {
			return me.$spawn( "Core.cli.output.Console", {} );
		} );

	}

	get pluginManager() {
		return this.iocContainer.resolve( "cliPluginManager" );
	}

	get commanderLib() {
		return this.iocContainer.resolve( "commanderLib" );
	}

	get outputHandler() {
		return this.iocContainer.resolve( "outputHandler" );
	}

	get pkg() {
		return require( PATH.join( __dirname, "..", "package.json" ) );
	}

	get version() {
		return this.pkg.version;
	}

	async execute() {

		// Locals
		let me = this;

		// Load plugins
		await me._loadPlugins();

		// Output the header/cli info
		await me._sayHello();

		// Defer to the commander library for the rest
		return me._execCommander();

	}

	async _sayHello() {

		// todo: `xcc --version` should not show the greeting

		// Locals
		let me = this;
		let out = me.outputHandler;

		// Build the greeting string
		let greeting = out.color( "XCC", "yellow" ) +
						out.color( " v" + me.version, "green" ) +
						"\n" +
						out.color( "The Core Framework CLI", "grey" );

		// Output the greeting
		out.greet( greeting );

	}

	_initCommander() {

		// Locals
		let me 		  = this;
		let commander = me.commanderLib;

		// Add the base/program-level options to commander
		commander.version( me.version );

	}

	async _loadPlugins() {

		// Locals
		let me 				= this;
		let pluginManager 	= me.pluginManager;

		// Load the "Global Plugin"
		let globalPluginPath = PATH.join( __dirname, ".." ); // todo: use a path manager & path resolver
		await pluginManager.loadPluginAt( globalPluginPath );

		// Load the "Mocha" plugin
		let mochaPluginPath = "/home/ec2-user/environment/msa/core-cli-plugin-mocha"; // todo: use a path manager & path resolver
		await pluginManager.loadPluginAt( mochaPluginPath );


	}

	async _execCommander() {

		// Locals
		let me 			= this;
		let commander 	= me.commanderLib;

		// Defer to the commander library
		commander.parse( process.argv );

	}

}

module.exports = Controller;
