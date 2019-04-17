/**
 * @file
 * Defines the Core.cli.command.BaseCommand class.
 *
 * @author Luke Chavers <me@lukechavers.com>
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { _, TIPE, CHOKIDAR } = Core.deps( "_", "tipe", "chokidar" );

/**
 * The base class that all CLI commands should inherit from.
 *
 * @memberOf Core.cli.command
 * @extends Core.abstract.Component
 */
class BaseCommand extends Core.cls( "Core.abstract.Component" ) {

	$construct( outputHandler, commanderCommand ) {

		// Require the `commandLoader` class dep
		this.$require( "outputHandler", {
			instanceOf: "Core.cli.output.Base"
		} );

		// Require the `commanderCommand` class dep
		this.$require( "commanderCommand", {
			type: "object"
		} );

		// Persist the class deps
		this._outputHandler    = outputHandler;
		this._commanderCommand = commanderCommand;

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
	 * The `Command` object that is provided by the `commander` library.  It is named `options`, here,
	 * because it includes information about the arguments passed to commander.
	 *
	 * @access public
	 * @default null
	 * @type {Object}
	 */
	get options() {
		return this._commanderCommand;
	}

	async _executeAndWatch( fn, opts ) {

		// Locals
		let me = this;

		// Apply option defaults
		opts = _.defaultsDeep( {}, opts, {
			watchPaths   : [],
			watchOptions : {

			},
			enableWatchDebug: false
		} );

		// Extract the option parts
		let { watchPaths, watchOptions } = opts;

		// Do the initial execution
		fn.apply( me, [] );

		// Create a debounced edition of our function
		let debounced = _.debounce( fn.bind( me ), 500 );

		// Create a watcher
		let watcher = CHOKIDAR.watch( watchPaths, watchOptions );

		// Monitor the watcher
		watcher.on( "change", function onWatchTriggered( fileTriggered ) {

			// Do subsequent execution
			debounced.apply( me, [] );

		} );

		// Watch debugging
		if( opts.enableWatchDebug ) {

			watcher.on( "all", function( ev ) {

				if( ev !== "add" ) {

					me.out.log( "- watch all -" );
					me.out.log( arguments );

				}

			} );

		}

		// Return a promise
		return new Promise(

			function( resolve, reject ) {

				// todo: this will never resolve; add SIGTERM monitoring...

			}

		);

	}

}

module.exports = BaseCommand;
