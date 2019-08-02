/**
 * @file
 * Defines the Core.cli.command.Loader class.
 *
 * @author Luke Chavers <me@lukechavers.com>
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { _, BLUEBIRD, TIPE } = Core.deps( "_", "bluebird", "tipe" );

/**
 * Manages the loading of CLI commands. Plugins will use this class to add commands to the CLI.
 *
 * @memberOf Core.cli.command
 * @extends Core.abstract.Component
 */
class Loader extends Core.mix( "Core.abstract.Component", "Core.asset.mixin.Parenting" ) {

	$construct( commanderLib, outputHandler ) {

		// Require the `commanderLib` class dep
		this.$require( "commanderLib", {
			isObject: true
		} );

		// Require the `commandLoader` class dep
		this.$require( "outputHandler", {
			instanceOf: "Core.cli.output.Base"
		} );

		// Store class deps
		this._commanderLib  = commanderLib;
		this._outputHandler = outputHandler;

		// Initialize the command store/cache
		this._commandStore = new Set();

	}

	/**
	 * The `commander` library/module.
	 *
	 * @access public
	 * @default null
	 * @type {Object}
	 */
	get commanderLib() {
		return this._commanderLib;
	}

	/**
	 * Facilitates most CLI-specific output (as opposed to the more generic
	 * logging output, which is handled by the `Core.logging.Logger` class).
	 *
	 * @access public
	 * @default null
	 * @type {Core.cli.output.Base}
	 */
	get out() {
		return this._outputHandler;
	}

	/**
	 * An internal store of command information.  Single the `commander` library handles most of the
	 * logic after it has been initialized, this variable mainly serves as a registry for command
	 * introspection.
	 *
	 * @access public
	 * @default null
	 * @type {Set}
	 */
	get commandStore() {
		return this._commandStore;
	}

	/**
	 * Adds one or more commands to the CLI utility.  This is a convenience shortcut for multiple
	 * calls to `addCommand()`, which handles most of the logic for adding commands.
	 *
	 * @public
	 * @async
	 * @param {Object} plugin - Information about the plugin adding the command.
	 * @param {...string} commandClasses - The full, namespaced, path of one or more Core Framework classes that
	 * inherit from `Core.cli.command.BaseCommand`.
	 * @returns {Promise<void>} A promise that resolves once the commands have been successfully entered.
	 */
	async addCommands( plugin, ...commandClasses ) {

		// Locals
		let me = this;
		let promises = [];

		// Flatten to allow array and nested array parameters.
		commandClasses = _.flattenDeep( commandClasses );

		// Add each command and put the returned promises in an array
		_.each( commandClasses, function( className ) {
			promises.push(
				me.addCommand( plugin, className )
			);
		} );

		// Wait for all of the command promises to complete.
		return BLUEBIRD.all( promises );

	}

	/**
	 * Adds a single command to the CLI utility.  This is usually called by a function named
	 * `initCommands()` that is provided by each plugin.
	 *
	 * @public
	 * @async
	 * @param {Object} plugin - Information about the plugin adding the command.
	 * @param {string} className - The full, namespaced, path of a Core Framework class that inherits from
	 * `Core.cli.command.BaseCommand`.
	 * @returns {Promise<void>} A promise that resolves once the command has been successfully entered.
	 */
	async addCommand( plugin, className ) {

		// Locals
		let me 			= this;
		let cls 		= Core.cls( className );
		let commander 	= me.commanderLib;
		let out         = me.out;

		// Initialize a 'Command' object via Commander.
		// (We do this here, instead of in the command class, because we want
		// some command information to be available outside of commander)
		let cmd = commander
			.command( cls.command )
			.description( cls.description + ` (Plugin:${plugin.name})` );

		// Defer to the command class to configure the details of the command
		// (such as options, etc) using its STATIC methods.
		await cls.addToCommander( cmd, me.out );

		// Add example to the command's --help, if provided
		if( cls.examples !== undefined ) {

			let commandExamples = cls.examples;

			// Additional text to be displayed in the help message.
			cmd.on( "--help", function() {

				out.log( "" );
				out.log( "Examples:" );
				out.log( "" );

				_.each( commandExamples, function( ex ) {
					out.log( "  $ xcc " + ex );
				} );

				out.log( "" );
				out.log( "" );

			} );


		}

		// After the command class has finished, we'll add the
		// action function, so that we can wrap it with additional
		// low-level logic.
		cmd.action( function commandActionOuterWrap( cmd ) {

			// We wrap another, inner, async function as an IIFE so
			// that we can use async and await within the command class.
			return ( async function commandActionInnerWrap() {

				//console.log( cmd._name );

				out.log(
					" " +
					out.symbol( "pointer", "yellow" ) +
					" " +
					out.color( "Executing command: ", "bold" ) + out.color( "'" + cmd._name + "'", "cyan" ) + "\n\n"
				);


				// The command class interacts with Commander configuration via STATIC methods, but we'll
				// instantiate an instance of the command class to handle the actual execution.  This allows
				// us to use the framework's class logic, like `$construct` and the IoC Container.
				let inst = me.$spawn( cls, {

					// Some extra information, just in case
					// the command needs any of it.
					commanderLib     : commander,
					pluginData       : plugin,
					commanderCommand : cmd

				} );

				// Defer to the command class' `execute()` command.
				return inst.execute().then(

					function() {

						// Bottom pad after command completes
						out.log( "\n\n" );

					}

				);

			}() );

		} );

		// Now we add this command to this command loader's
		// command store (which is, basically, a registry).
		me._commandStore.add( {
			commander: {
				lib     : commander,
				command : cmd
			},
			command: {
				command         : cls.command,
				constructorName : cls.name,
				className       : className,
				description     : cls.description,
				cls             : cls
			},
			plugin: plugin
		} );

	}

}

module.exports = Loader;
