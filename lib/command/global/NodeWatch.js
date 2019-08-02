/**
 * @file
 * Defines the Core.cli.command.global.NodeWatch class.
 *
 * @author Luke Chavers <me@lukechavers.com>
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Node.js Built-Ins
const CP 	= require( "child_process" );
const SPAWN = CP.spawn;

// Load dependencies using the Core Framework
const { _ } = Core.deps( "_" );

/**
 * Provides the 'list-commands' command.
 *
 * @memberOf Core.cli.command.global
 * @extends Core.cli.command.BaseModuleCommand
 */
class NodeWatch extends Core.cls( "Core.cli.command.BaseModuleCommand" ) {

	//$construct() {}

	static get command() {
		return "node-watch";
	}

	static get description() {
		return "Executes a Node.js script (i.e. application) and restarts it when the project source changes.";
	}

	static async addToCommander( cmd, outputHandler ) {

		// Locals
		let out = outputHandler;

		// Options
		cmd.option( "-f, --file <string>", "Allows the script to be specified instead of the default." )

			// Additional text to be displayed in the help message.
			.on( "--help", function() {

				out.log( "" );
				out.log( "Examples:" );
				out.log( "" );
				out.log( "  $ xcc node-watch" );
				out.log( "  $ xcc node-watch -f ./lib/index.js" );

			} );

	}

	async execute() {

		// Locals
		let me = this;

		// Gather all of the files that we want to watch...
		let libFiles = await me.getLibFiles();

		// Merge the files into a single array
		let watchFiles = _.flatten( [ libFiles ] );

		// Wrap the Mocha execution in a watch wrapper...
		return this._executeAndWatch( () => {

			// The following code will be called once, at the start,
			// and then again each time the watch is triggered.
			return me.runNode();

		}, {

			watchPaths   : watchFiles,
			watchOptions : {}

		} );

	}

	async runNode() {

		// Locals
		let me  = this;
		let out = me._outputHandler;
		let scriptPath;

		// Resolve the target script path
		if( _.isString( me._commanderCommand.file ) ) {
			scriptPath = await me._cwd.normalizeChildPath( me._commanderCommand.file );
		} else {
			scriptPath = await me._cwd.normalizeChildPath( "index.js" );
		}


		//console.log( process.env );
		//process.exit( 0 );

		if( !_.isNil( me._lastProcess ) ) {

			me._lastProcess.kill( "SIGTERM" );

			// `runNode` will be called again by the 'close' event..
			// so we can exit here..
			return;

		}

		// Inform the user
		out.chevron( "Running Node: '" + scriptPath + "'", 1, "cyan", "green" );
		out.div();

		const nodeProcess = SPAWN( "node", [ scriptPath ] );

		/**
		 * A simple helper for displaying output from the child process.
		 *
		 * @private
		 * @param {string} streamName - The name of the stream that the output was received on.
		 * @param {string} data - The text from the child process.
		 * @returns {void}
		 */
		function showChildOutput( streamName, data ) {

			// Trim
			data = _.trimEnd( data );

			// If `data` is multi-line, then we'll break it
			// apart and send it back through, line-by-line.
			if( data.indexOf( "\n" ) !== -1 ) {
				let arr = data.split( "\n" );
				_.each( arr, ( line ) => {
					showChildOutput( streamName, line );
				} );
				return;
			}

			// Color the stream
			if( streamName === "stdout" ) {
				streamName = out.color( streamName, "green" );
			} else if( streamName === "stderr" ) {
				streamName = out.color( streamName, "red" );
			}

			// Output
			out.log( out.color( "child.", "grey" ) + streamName + out.color( "  |  ", "grey" ) + data );

		}

		nodeProcess.stdout.on( "data", ( data ) => {
			showChildOutput( "stdout", data );
		} );

		nodeProcess.stderr.on( "data", ( data ) => {
			showChildOutput( "stderr", data );
		} );

		nodeProcess.on( "close", ( code ) => {

			out.div();

			if( code === null ) {
				out.star( "Changes detected; restarting the process ..." );
			} else if( code === 0 || code === "0" ) {
				out.star( "Child process exited with code " + out.color( "0", "green" ) );
			} else {
				out.star( "Child process exited with code " + out.color( code, "red" ) );
			}

			out.blank();

			nodeProcess.stdout.removeAllListeners( "data" );
			nodeProcess.stderr.removeAllListeners( "data" );
			nodeProcess.removeAllListeners( "close" );

			me._lastProcess = null;

			setTimeout( function() {
				me.runNode();
			}, 5 );

		} );

		me._lastProcess = nodeProcess;

	}

	tmp() {

		// Locals
		let me 			 = this;
		let out          = me.out;
		//let showDetails	 = false;
		//let findString   = null;

		// Check for the detailed option
		/*
		if( me.options.details === true ) {
			showDetails = true;
		}

		// Check for the 'find' option
		if( me.options.find !== undefined && !_.isEmpty( me.options.find ) ) {
			findString = me.options.find;
		}
		*/

		out.log( "testing" );
		return;

		// Iterate over each command in the registry/store
		commandStore.forEach(

			function( commandInfo ) {

				// Implements 'find' logic..
				let showThisCommand;
				if( findString === null ) {
					showThisCommand = true;
				} else if( commandInfo.command.command.indexOf( findString ) !== -1 ) {
					showThisCommand = true;
				} else {
					showThisCommand = false;
				}

				// Display the command..
				if( showThisCommand === true ) {

					// Display the command name, with a star..
					let commandName = out.bold( commandInfo.command.command );

					if ( showDetails ) {
						commandName += " " + out.color( "(" + commandInfo.command.className + ")", "grey" );
					}

					out.star( commandName );

					// Display the command description
					out.color( out.indent( commandInfo.command.description, 2 ), "white", true );

					// Show plugin info, if desired
					if ( showDetails ) {

						let plugin     = commandInfo.plugin;
						let pluginInfo = out.color( "From Plugin: ", "green" ) + out.color( plugin.name, "cyan" );

						pluginInfo += " " + out.color( "(" + plugin.packageName + ":" + plugin.version + ")", "grey" );
						//console.log( commandInfo.plugin );

						out.indent( pluginInfo, 2, true );
					}

					// Add a blank line after each command
					out.log( "" );

				}

			}

		);

	}

}

module.exports = NodeWatch;
